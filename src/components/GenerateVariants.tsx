import {
  DocumentReference,
  Product,
  VariantContainer,
  VariantOptionGroup,
} from '../types'
import { useITSContext } from '../context/ITSCoreProvider'

import { useToast, Grid, Flex, Button, Dialog, Stack, Box, Card, Text, Checkbox, Inline, Spinner } from '@sanity/ui'
import { SparklesIcon, TrashIcon } from '@sanity/icons'
import {fromString as pathFromString} from '@sanity/util/paths'
import React, { useCallback, useState, useEffect } from 'react'
import { ArrayOfObjectsInputProps, set, useFormValue, useClient } from 'sanity'
import { usePaneRouter } from 'sanity/structure'
import { v4 as uuidv4 } from 'uuid';
import {nanoid} from 'nanoid'

import {ConfirmButton} from './ConfirmButton';
import {Details} from './Details';
import {LoadingBox} from './LoadingBox';
import {CoverImageDialog} from './CoverImageDialog';
import {ProductVariantItem} from './ProductVariantItem'


type VariantsInputProps = Omit<ArrayOfObjectsInputProps, 'value'> & {
  value: DocumentReference[]
}

type ResolvedReference = {
  _id: string
  _type: string
}
type VariantReferences = {
   _id: string,
  references: ResolvedReference[]
}

export function GenerateVariants(props: VariantsInputProps) {
  const { t, helpers, apiVersion } = useITSContext();
  const client = useClient({apiVersion})


  const toast = useToast()
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [coverImageDialogVariant, setCoverImageDialogVariant] = useState<string | undefined>(undefined);
  const { onChange, value} = props
  
  const [loading, setLoading] = useState(true);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [variantOptionGroups, setVariantOptionGroups] = useState<VariantOptionGroup[]>([]);
  const [variants, setVariants] = useState<VariantContainer[]>([]);
  const [variantIdLoading, setVariantIdLoading] = useState<string | undefined>(undefined);
  const originalDocument = useFormValue([]) as Product;
  const productImages = originalDocument.images ?? [];
  const {routerPanesState, groupIndex, handleEditReference} = usePaneRouter();

  const fetchVariants = async () => {
    if (!value) return

    if (value.length > 0) {
      setLoadingVariants(true);
      // await delay(2000)
      try {
        const fields = `
          _id,
          _rev,
          _type,
          options[]->{_id, title},
          title,
          featured,
          active,
          price,
          coverImage,
          productNumber
        `
        const query = `*[_type == "productVariant" && _id in $ids] {
          _id,
          "published": *[_type == "productVariant" && _id == ^._id][0]{${fields}},
          "draft": *[_type == "productVariant" && _id == "drafts." + ^._id][0]{${fields}}
        }`

        const ids = value.map((ref) => ref._ref)
        const data = await client.fetch(query, {ids: ids});
        setVariants(data);
      } catch (error) {
        console.error('Error fetching variants: ', error);
      } finally {
        setLoadingVariants(false);
      }
    }
    else {
      setVariants([])
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = `*[_type == "variantOptionGroup" && options != null] | order(sortOrder asc, title asc) {
          _id,
          sortOrder,
          title,
          options[]->{_id, title}
        }`
        const data = await client.fetch(query);
        setVariantOptionGroups(data);
      } catch (error) {
        console.error('Error fetching product groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [client]);

  useEffect(() => {
    if (!value) return
    fetchVariants();

    if (value.length == 0) return

    const newSubscriptions = value.map((variantRef) => {
      if (!variantRef?._ref) return null

      return client
        .listen(
          `*[_id == $id || _id == $draftId]`,
          { id: variantRef._ref, draftId: `drafts.${variantRef._ref}` },
          {visibility: 'query'}
        )
        .subscribe((update) => {
          // console.log(`Received update for ${variantRef._ref}:`, update)
          fetchVariants()
        })
    })

    // Cleanup listeners when component unmounts or value changes
    return () => newSubscriptions.forEach((sub) => sub?.unsubscribe())
  }, [value, client])


  const generateVariants = useCallback(async () => {
    if (Object.keys(selectedOptions).length === 0) {
      return [];
    }
    setLoadingVariants(true);

    // get the selected options for all groups
    const selected = Object.keys(selectedOptions).map((groupId) => {
      return selectedOptions[groupId].map((optionId) => {
        return {
          groupId,
          optionId,
        };
      });
    });

    // generate all possible combinations of selected options
    const combinations = getCombinations(selected);

    // create productVariant documents based on combinations
    const newVariants = combinations.map((combination, variantIndex) => {
      const optionRefs = combination.map((ref) => {
        return {
          _type: 'reference',
          _ref: ref.optionId,
          _key: nanoid(8)
        };
      });

      const newVariant = {
        _id: uuidv4().replaceAll("-", ""),
        _type: 'productVariant',
        title: originalDocument.title,
        ...originalDocument.productNumber && {productNumber: originalDocument.productNumber + '-' + (variantIndex+1)},
        options: optionRefs,
        featured: variantIndex === 0,
        active: true,
        stock: 0,
      };
      return newVariant;
    })

    const transaction = client.transaction();
    //create variants
    newVariants.forEach(variant => transaction.create(variant));

    try {
      await transaction.commit();
      //create variant refs on transactionsuccess
      const variantRefs = newVariants.map(variant => ({
        _type: 'reference',
        _ref: variant._id,
        _key: nanoid(8)
      }))
      onChange(set(variantRefs));
      setSelectedOptions({});
    } catch (error) {
      console.error('Transaction failed:', error);
    }
    
    setLoadingVariants(false);
  },[onChange, client, originalDocument, selectedOptions]);

  const getCombinations = (arr: Array<Array<{ groupId: string; optionId: string }>>): Array<Array<{ groupId: string; optionId: string }>> => {
    if (arr.some(inner => inner.length === 0)) return [];

    // Helper function to generate all combinations of arrays
    const result: Array<Array<{ groupId: string; optionId: string }>> = [];

    function combine(input: Array<Array<{ groupId: string; optionId: string }>>, index = 0, current: Array<{ groupId: string; optionId: string }> = []) {
      if (index === input.length) {
        result.push(current);
        return;
      }

      for (let i = 0; i < input[index].length; i++) {
        combine(input, index + 1, [...current, input[index][i]]);
      }
    }

    combine(arr);
    return result;
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogSubmit = async () => {
    await generateVariants();
    setDialogOpen(false);
  };

  const handleDialogCancel = () => {
    setDialogOpen(false);
  };

  const toggleOption = (groupId: string, optionId: string) => {
    setSelectedOptions((prev) => {
      const groupOptions = prev[groupId] || [];
      const updatedGroupOptions = groupOptions.includes(optionId)
        ? groupOptions.filter((id) => id !== optionId)
        : [...groupOptions, optionId];

      const newSelected = { ...prev, [groupId]: updatedGroupOptions };
      if (updatedGroupOptions.length === 0) {
        delete newSelected[groupId]; // remove empty groups
      }
      return newSelected;
    });
  };

  const groupOptionsSelected = (groupId: string) => {
    const numOptions = selectedOptions[groupId] ? selectedOptions[groupId].length : 0;
    return numOptions
  }

  const deleteVariants = useCallback(async (variantIds: string[]) => {
    // first check if any variants are referenced anywhere else
    const refQuery = `
      *[_type == "productVariant" && _id in $ids] {
        _id,
        "references": *[references(^._id) && _id != $productId] { _id, _type }
      }
    `
    const variantRefs: VariantReferences[] = await client.fetch(refQuery, {ids: variantIds, productId: originalDocument._id})
    const variantIdsToDelete = variantRefs.filter(ref => ref.references.length === 0).map(ref => ref._id)
    if (variantIdsToDelete.length > 0) {
      const transaction = client.transaction();

      transaction.patch(originalDocument._id, (patch) =>
        patch.set({variants: value.filter(ref => !variantIdsToDelete.includes(ref._ref))})
      );

      variantIdsToDelete.forEach(variantId => transaction.delete(variantId))
      try {
        await transaction.commit();
        // fetchVariants();
      } catch (error) {
        toast.push({
          status: "error",
          title: t('ui.errors.failedToLoad', {errorMessage: error})
        });
      }
    }
    if (variantIdsToDelete.length < variantIds.length) {
      toast.push({
        status: "warning",
        title: t("variants.couldNotDeleteAll")
      });
    }
  },[client, originalDocument, value, t, toast])

  // Clear out existing variants
  const handleClear = useCallback(async () => {
    setLoadingVariants(true);
    await deleteVariants(value.map((ref) => ref._ref));
    setLoadingVariants(false);

  },[deleteVariants, value])

  const handleVariantRefClick = async (variantId: string) => {
    const childParams = routerPanesState[groupIndex + 1]?.[0].params || {}
    const {parentRefPath} = childParams

    handleEditReference({
      id: variantId,
      type: "productVariant",
      // Uncertain that this works as intended
      parentRefPath: parentRefPath ? pathFromString(parentRefPath) : [``],
      template: {id: variantId},
    })
  }

  const handleVariantDeleteClick = useCallback(async (variantId: string) => {
    setVariantIdLoading(variantId)
    await deleteVariants([variantId])
    // delete published variant ref
    // onChange(set(value.filter(ref => ref._ref != variantId)));
    setVariantIdLoading(undefined)
  },[deleteVariants])

  const getVariantDraftTransaction = async (variantId: string) => {
    const variant = variants.find(v => v._id === variantId)
    if (!variant) {
      console.error(`Variant ${variantId} not found`)
      return {transaction: null, draftId: null}
    }
    const hasDraft = variant.draft != null
    const draftId = "drafts." + variant._id
    const transaction = client.transaction();
    if (!hasDraft) {
      const variantDoc = await client.getDocument(variant._id)
      if (variantDoc) {
        transaction.createIfNotExists({...variantDoc, _id: draftId})
      }
    }
    return {transaction, draftId}
  }

  const handleCoverImageDialogOpen = (variantId: string) => {
    setCoverImageDialogVariant(variantId);
  };

  const handleCoverImageDialogSubmit = async (assetRef: string | undefined) => {
    if (! coverImageDialogVariant) {
      return
    }

    setVariantIdLoading(coverImageDialogVariant)
    const {transaction, draftId} = await getVariantDraftTransaction(coverImageDialogVariant)
    if (! transaction) {
      return
    }

    if (assetRef) {
      transaction.patch(draftId, (v) => v.set({coverImage: assetRef}))
    } else  {
      transaction.patch(draftId, (v) => v.unset(["coverImage"]))
    }
    
    try {
      await transaction.commit();
      // fetchVariants();
    } catch (error) {
      console.error('Transaction failed:', error);
    }
    setVariantIdLoading(undefined)
    // setCoverImageDialogVariant(null);
  };

  const handleCoverImageDialogRemove = () => {
    handleCoverImageDialogSubmit(undefined);
  };
  const handleCoverImageDialogCancel = () => {
    setCoverImageDialogVariant(undefined);
  };

  const renderCoverImageDialog = () => {
    if (!coverImageDialogVariant || productImages.length == 0) {
      return null
    }
    const variant = variants.find(v => v._id === coverImageDialogVariant)
    if (!variant) {
      return null
    }
    const item = variant.draft ?? variant.published
    if (!item) {
      return null
    }
    return (
      <CoverImageDialog
        images={productImages}
        value={item.coverImage}
        onSubmit={handleCoverImageDialogSubmit}
        onRemove={handleCoverImageDialogRemove}
        onCancel={handleCoverImageDialogCancel}
        loading={variantIdLoading == coverImageDialogVariant}
      />
    )
  }
  
  return (
    loading ? <Spinner muted /> :
    <Stack space={3}>
      {variants.length == 0 && <Button
        style={{ cursor: 'pointer' }}
        icon={SparklesIcon}
        text={t('variants.generate')}
        tone='positive'
        disabled={loadingVariants}
        onClick={handleDialogOpen}
      />}
      {/* {value.length > 0 && <Button icon={SparklesIcon} text='Publish all Variants' tone='positive' disabled={loadingVariants} onClick={publishVariants} />} */}
      <Grid columns={1}>
        <Stack space={3}>
          {variants?.map((variant, index) => (
            <ProductVariantItem
              key={index}
              variant={variant}
              variantOptionGroups={variantOptionGroups}
              product={originalDocument}
              onClick={handleVariantRefClick}
              onCoverImageClick={handleCoverImageDialogOpen}
              onDelete={handleVariantDeleteClick}
              loading={variantIdLoading == variant._id}
            />))}
        </Stack>
      </Grid>
      {variants.length > 0 && (
        <ConfirmButton
          style={{ cursor: 'pointer' }}
          text={t("variants.deleteAll.title")}
          confirmText={t("variants.deleteAll.confirm")}
          icon={TrashIcon}
          tone="critical"
          onConfirm={handleClear}
          disabled={loadingVariants}
        />)
      }

      {isDialogOpen && (
        <Dialog
          header={
            <Card paddingTop={3}>
              <Inline space={2}>
                <Button
                  style={{ cursor: 'pointer' }}
                  text={`${t("variants.generate")}`}
                  tone="primary"
                  onClick={handleDialogSubmit}
                  disabled={!Object.values(selectedOptions).some((options) => options.length > 0) || loadingVariants}
                />
              </Inline>
            </Card>
          }
          id="generate-variants-dialog"
          onClose={handleDialogCancel}
          width={1}
        >
          <LoadingBox
            content={
              <Stack space={4}>
                {variantOptionGroups.map((group) => (
                  <Card
                    key={group._id}
                    padding={3}
                    radius={2}
                    shadow={1}
                    tone="default"
                  >
                    <Details title={(
                      <Text weight="bold" size={2} style={{ cursor: 'pointer' }}>
                        {helpers.localizer.stringValue(group.title)} ({groupOptionsSelected(group._id)}/{group.options.length})
                      </Text>
                    )}>{(
                      <Stack space={3} padding={3}>
                        {group.options.map((option) => (
                          <Flex align="center" key={option._id}>
                            <Checkbox
                              id={option._id}
                              checked={(selectedOptions[group._id] || []).includes(option._id)}
                              onChange={() => toggleOption(group._id, option._id)}
                              label={helpers.localizer.stringValue(option.title)}
                            />
                            <Box flex={1} paddingLeft={3}>
                              <Text>
                                <label htmlFor={option._id}>{helpers.localizer.stringValue(option.title)}</label>
                              </Text>
                            </Box>
                          </Flex>
                        ))}
                      </Stack>
                    )}</Details>
                  </Card>
                ))}
              </Stack>
            }
            loading={loadingVariants}
          />
        </Dialog>
      )}
      {renderCoverImageDialog()}
    </Stack>
  )
}