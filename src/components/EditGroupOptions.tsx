import { useITSContext } from '../context/ITSCoreProvider'
import {DocumentReference, VariantOption} from '../types'

import React, { useState, useEffect, useCallback } from 'react'
import { useToast, Flex, Button, Stack, Card, Spinner, Text } from '@sanity/ui'
import { SparklesIcon, TrashIcon } from '@sanity/icons'
import { ArrayOfObjectsInputProps, useFormValue, set, useClient, SanityDocument } from 'sanity'
import {fromString as pathFromString} from '@sanity/util/paths'
import { usePaneRouter } from 'sanity/structure'
import {nanoid} from 'nanoid'
import { v4 as uuidv4 } from 'uuid';

import {ConfirmButton} from './ConfirmButton';


type Props = Omit<ArrayOfObjectsInputProps, 'value'> & {
  value?: DocumentReference[]
}

export const EditGroupOptions = (props: Props) => {
  const { t, localizer, config } = useITSContext();
  
  const client = useClient({apiVersion: config.apiVersion})

  const { value, onChange } = props;
  const toast = useToast()
  const [options, setOptions] = useState<VariantOption[]>([]);
  const [loading, setLoading] = useState(false);
  const {routerPanesState, groupIndex, handleEditReference} = usePaneRouter();
  const originalDocument = useFormValue([]) as SanityDocument;
  
  // useEffect(() => {
    const fetchData = async () => {
      if (!value || value.length === 0) {
        setOptions([]);
        return;
      }

      try {
        if (value.length > 0) {
          const ids = value.map((ref) => ref._ref);
          // 1. Fetch both published and draft versions
          // 2. We use a GROQ trick to group them by their "base ID"
          const query = `*[_type == "variantOption" && (_id in $ids || _id in $draftIds)] {
            _id,
            title,
            sortOrder
          }`;

          const draftIds = ids.map(id => `drafts.${id}`);
          const data: VariantOption[] = await client.fetch(query, { ids, draftIds });

          // 3. De-duplicate: If both draft and published exist, pick the draft.
          const merged = ids.map(baseId => {
            const draft = data.find(d => d._id === `drafts.${baseId}`);
            const published = data.find(d => d._id === baseId);
            return draft || published;
          }).filter(Boolean) as VariantOption[];
          const sorted = merged.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
          setOptions(sorted);
        }
      } catch (error) {
        console.error('Error fetching product groups:', error);
      }
    };

  //   fetchData();
  // }, [client, value]);

  useEffect(() => {
    if (!value || value.length === 0) return;


    setLoading(true);
    fetchData();
    setLoading(false);

    const ids = value.map(ref => ref._ref);
    const draftIds = ids.map(id => `drafts.${id}`);

    // One listener for all related options
    const sub = client
      .listen(
        `*[_type == "variantOption" && (_id in $ids || _id in $draftIds)]`,
        { ids, draftIds },
        { visibility: 'query' }
      )
      .subscribe(() => fetchData());

    return () => sub.unsubscribe();
  }, [value, client])

  const deleteOption = useCallback(async (optionId: string) => {
    if (!value) return
    // is referenced in a productVariant?
    const query = `count(*[_type == "productVariant" && references($id)]) > 0`
    const isUsed = await client.fetch(query, { id: optionId });

    if (!isUsed) {
      const transaction = client.transaction();
      transaction.patch(originalDocument._id, (patch) =>
        patch.set({options: value?.filter(ref => ref._ref !== optionId)})
      );

      transaction.delete(optionId)
      try {
        await transaction.commit();
      } catch (error) {
        toast.push({
          status: "error",
          title: t('ui.errors.failedToLoad', {errorMessage: error})
        });
      }
    } else {
      toast.push({
        status: "warning",
        title: t("optionsGroups.couldNotDeleteOption")
      });
    }
  },[client, originalDocument, value, t, toast])

  const handleRemove = useCallback(async (optionId: string) => {
    setLoading(true);
    await deleteOption(optionId);
    setLoading(false);
  }, [deleteOption]);
  
  const handleOptionClick = async (optionValueId: string) => {
    const childParams = routerPanesState[groupIndex + 1]?.[0].params || {}
    const {parentRefPath} = childParams
    const cleanId = optionValueId.replace('drafts.', '');

    handleEditReference({
      id: cleanId,
      type: "variantOption",
      // Uncertain that this works as intended
      parentRefPath: parentRefPath ? pathFromString(parentRefPath) : [``],
      template: {id: optionValueId},
    })
  };
  
  const handleAddOption = async () => {
    setLoading(true);

    const maxSort = options.reduce((max, opt) => Math.max(max, opt.sortOrder ?? 0), 0);
    const newOption = await client.create({
      _id: uuidv4().replaceAll("-", ""),
      _type: 'variantOption',
      title: [
        { _key: config.localization.defaultLocale, value: t('optionsGroups.defaults.title') }
      ],
      sortOrder: maxSort + 1
    });

    // Add the new reference to the array
    const newValues = value ? value : []
    onChange(set([...newValues, { _type: 'reference', _ref: newOption._id, _key: nanoid(8) }]));
    handleOptionClick(newOption._id)
    setLoading(false);
  };

  return loading ? <Spinner muted /> : (
    <Stack space={3}>
      {options.map((option, index) => {
        const baseId = option._id.replace('drafts.', '');
        const isDraft = option._id.startsWith('drafts.')
        const tone = isDraft ? 'caution' : 'positive'
        return (
          <Card key={index} padding={3} radius={2} shadow={1}>
            <Flex justify="space-between" align="center" gap={2}>
              <Button
                mode='ghost'
                tone={tone}
                // tone={tone}
                onClick={() => handleOptionClick(baseId)}
                style={{
                  whiteSpace: 'normal',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'left',
                  lineHeight: '1.4',
                }}>
                <Stack space={1}>
                  <Text>{localizer.value(option.title) || t('optionsGroups.defaults.title')}</Text>
                </Stack>
              </Button>
              <ConfirmButton
                onConfirm={() => handleRemove(baseId)}
                confirmText={t("optionsGroups.confirmDelete")}
                icon={TrashIcon}
                tone="critical"
              />
            </Flex>
          </Card>
        )
      })}
      <Button icon={SparklesIcon} text={t('optionsGroups.addOption')} tone='positive' onClick={handleAddOption} />
    </Stack>
  );
}