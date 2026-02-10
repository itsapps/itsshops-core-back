import { useITSContext } from '../context/ITSCoreProvider'
import React from 'react'
import { useClient } from 'sanity'
import {Heading, Container, Text, Box, Button, Grid, Stack, Flex, Card} from '@sanity/ui'
import { ImageIcon, TrashIcon } from '@sanity/icons'
import imageUrlBuilder from '@sanity/image-url'

import { Product, VariantContainer, VariantOption, VariantOptionGroup } from "../types";
import {ConfirmButton} from './ConfirmButton';
import {LoadingBox} from './LoadingBox';
import { LocaleImageView } from './LocaleImageView';

type Props = {
  variant: VariantContainer
  variantOptionGroups: any[]
  product: Product
  onClick: (variantId: string) => void
  onDelete: (variantId: string) => void
  loading: boolean
}

export const ProductVariantItem = ({variant, variantOptionGroups, product, onClick, onDelete, loading}: Props) => {
  const { t, localizer } = useITSContext();

  const item = variant.draft ?? variant.published
  const isDraft = item._id.startsWith('drafts.')
  const isInactive = item.active == false
  const image = product.images?.[0]

  const getVariantTitles = (variantOptions: VariantOption[], optionGroups: VariantOptionGroup[]) => {
    if (variantOptions == null) return []
  
    const optionTitles = variantOptions.map((option) => {
      const optionGroup = optionGroups.find((group) => group.options.map(o => o._id).includes(option._id));
      if (!optionGroup) {
        return {
          group: null,
          groupTitle: null,
          optionTitle: localizer.value(option.title)
        }
      }
      return {
        group: optionGroup?._id,
        groupTitle: localizer.value(optionGroup?.title),
        optionTitle: localizer.value(option.title)
      }
    })
    // sort optionsTitles by group sortOrder
    optionTitles.sort((a, b) => {
      const aGroup = optionGroups.find((group) => group._id === a.group);
      const bGroup = optionGroups.find((group) => group._id === b.group);
      if (aGroup && bGroup) {
        return aGroup.sortOrder - bGroup.sortOrder
      }
      return 0
    })
    const titles = optionTitles.map(option => ({
      group: option.groupTitle,
      option: option.optionTitle
    }))
    return titles
  };

  const tone = isInactive ? 'default' : isDraft ? 'caution' : 'positive'
  return (
    <LoadingBox
      content={
        <Card key={item._id} padding={3} radius={2} shadow={1} tone={tone}>
          <Flex gap={1} direction={['column', 'column', 'row']} justify={'space-between'}>
            <Stack space={1} flex={1}>
              <Flex flex={[1, 2, 3]} gap={1} direction={'column'}>
                <Heading as="h3" onClick={() => onClick(item._id)} style={{ cursor: 'pointer' }}>{localizer.value(item.title)}</Heading>
                {item.sku && <Text size={0}>{item.sku}</Text>}
                <Container paddingTop={3}>
                  <ul style={{ margin: 0, marginLeft: "10px", padding: 0 }}>
                    {getVariantTitles(item.options, variantOptionGroups)
                      .map((entry, i) => (
                        <li key={i}>
                          <strong style={{ fontWeight: 'bold' }}>{entry.group}</strong>: {entry.option}
                        </li>
                      )
                    )}
                  </ul>
                </Container>
              </Flex>
            </Stack>
            <Flex gap={1} align={"center"} justify={"center"}>
              <Grid columns={1} gap={1} padding={4}>
                <Box>
                  <LocaleImageView image={image} />
                  </Box>
              </Grid>
              <ConfirmButton
                style={{ cursor: 'pointer' }}
                confirmText={t('variants.deleteSingle.confirm')}
                title={t('variants.deleteSingle.title')}
                icon={TrashIcon}
                tone="critical"
                onConfirm={() => onDelete(variant._id)}
              />
            </Flex>
          </Flex>
        </Card>
      }
      loading={loading}
    />
  )
}