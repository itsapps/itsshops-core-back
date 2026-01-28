import { useITSContext } from '../context/ITSCoreProvider'
import {DocumentReference, VariantOption} from '../types'

import React, { useState, useEffect, useCallback } from 'react'
import { useToast, Grid, Flex, Button, Stack, Card, Spinner } from '@sanity/ui'
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
  const { t, helpers, apiVersion } = useITSContext();
  const client = useClient({apiVersion})

  const { value, onChange } = props;
  const toast = useToast()
  const [options, setOptions] = useState<VariantOption[]>([]);
  const [loading, setLoading] = useState(false);
  const {routerPanesState, groupIndex, handleEditReference} = usePaneRouter();
  const originalDocument = useFormValue([]) as SanityDocument;
  
  useEffect(() => {
    const fetchData = async () => {
      if (!value) return

      setLoading(true);
      try {
        if (value.length > 0) {
          const query = `*[_type == "variantOption" && _id in $ids]{
            _id,
            title
          }`
          const data = await client.fetch(query, {ids: value.map((ref) => ref._ref)});
          setOptions(data);
        } else {
          setOptions([]);
        }
      } catch (error) {
        console.error('Error fetching product groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [client, value]);

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

    handleEditReference({
      id: optionValueId,
      type: "variantOption",
      // Uncertain that this works as intended
      parentRefPath: parentRefPath ? pathFromString(parentRefPath) : [``],
      template: {id: optionValueId},
    })
  };
  
  const handleAddOption = async () => {
    setLoading(true);
    const newOption = await client.create({
      _id: uuidv4().replaceAll("-", ""),
      _type: 'variantOption',
      title: [
        { _key: 'de', value: 'Neue Option' }
      ],
      sortOrder: value ? value.length : 0
    });

    // Add the new reference to the array
    const newValues = value ? value : []
    onChange(set([...newValues, { _type: 'reference', _ref: newOption._id, _key: nanoid(8) }]));
    handleOptionClick(newOption._id)
    setLoading(false);
  };

  return (

      <Stack space={3}>
        {loading ? <Spinner muted /> : (
          <>
        <Grid columns={1}>
          <Stack space={3}>
            {value && value.map((item, index) => {
              const option = options.find(o => o._id === item._ref)
              return (
                <Card key={index} padding={3} radius={2} shadow={1}>
                  <Flex justify="space-between" align="center" gap={2}>
                    <Button
                      mode='ghost'
                      onClick={() => handleOptionClick(item._ref)}
                      style={{
                        whiteSpace: 'normal',
                        display: 'flex',
                        flexDirection: 'column',
                        textAlign: 'left',
                        lineHeight: '1.4',
                      }}>
                      <Stack space={1}>
                        <div>{option ? helpers.localizer.stringValue(option.title) : ''}</div>
                      </Stack>
                    </Button>
                    <ConfirmButton
                      onConfirm={() => handleRemove(item._ref)}
                      confirmText={t("optionsGroups.confirmDelete")}
                      icon={TrashIcon}
                      tone="critical"
                    />
                  </Flex>
                </Card>
              )
            })}
          </Stack>
        </Grid>
        <Button icon={SparklesIcon} text={t('optionsGroups.addOption')} tone='positive' onClick={handleAddOption} />
        </>
      )}
      </Stack>

  );
}