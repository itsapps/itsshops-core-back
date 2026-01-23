
import React from 'react'
import {useTranslation, useCurrentLocale, useClient} from 'sanity'
import {Heading, Container, Text, Box, Button, Grid, Stack, Flex, Card} from '@sanity/ui'
import { ImageIcon, TrashIcon } from '@sanity/icons'
import imageUrlBuilder from '@sanity/image-url'

import {apiVersion} from '@helpers/globals'
import {localizedValue} from '@helpers/utils'
import { Product, VariantContainer, VariantOption, VariantOptionGroup } from "@typings/models";
import {ConfirmButton} from '@components/ConfirmButton';
import {LoadingBox} from '@components/LoadingBox';

type Props = {
  variant: VariantContainer
  variantOptionGroups: any[]
  product: Product
  onClick: (variantId: string) => void
  onCoverImageClick: (variantId: string) => void
  onDelete: (variantId: string) => void
  loading: boolean
}

export const ProductVariantItem = ({variant, variantOptionGroups, product, onClick, onCoverImageClick, onDelete, loading}: Props) => {
  const {t} = useTranslation('itsapps')
  const locale = useCurrentLocale().id.substring(0, 2)
  const client = useClient({apiVersion})
  const imageBuilder = imageUrlBuilder(client)

  const item = variant.draft ?? variant.published
  const isDraft = item._id.startsWith('drafts.')
  const isInactive = item.active == false
  const coverImageAssetRef = item.coverImage
  const productImages = product.images || []
  const image = coverImageAssetRef && productImages.find(image => image.asset?._ref === coverImageAssetRef)

  const getVariantTitles = (variantOptions: VariantOption[], optionGroups: VariantOptionGroup[], locale: string) => {
    if (variantOptions == null) return []
  
    const optionTitles = variantOptions.map((option) => {
      const optionGroup = optionGroups.find((group) => group.options.map(o => o._id).includes(option._id));
      if (!optionGroup) {
        return {
          group: null,
          groupTitle: null,
          optionTitle: localizedValue(option.title, locale)
        }
      }
      return {
        group: optionGroup?._id,
        groupTitle: localizedValue(optionGroup?.title, locale),
        optionTitle: localizedValue(option.title, locale)
      }
    })
    // sort optionsTitles by group sort_order
    optionTitles.sort((a, b) => {
      const aGroup = optionGroups.find((group) => group._id === a.group);
      const bGroup = optionGroups.find((group) => group._id === b.group);
      if (aGroup && bGroup) {
        return aGroup.sort_order - bGroup.sort_order
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
                <Heading as="h3" onClick={() => onClick(item._id)} style={{ cursor: 'pointer' }}>{localizedValue(item.title, locale)}</Heading>
                {item.productNumber && <Text size={0}>{item.productNumber}</Text>}
                <Container paddingTop={3}>
                  <ul style={{ margin: 0, marginLeft: "10px", padding: 0 }}>
                    {getVariantTitles(item.options, variantOptionGroups, locale)
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
                  {(image && image.asset) ? (
                    <Button
                      style={{ cursor: 'pointer' }}
                      tone="primary"
                      onClick={() => onCoverImageClick(variant._id)}
                      padding={0}
                      icon={
                        <img
                          title={t('variants.coverImage.select')}
                          alt={`${image.asset._ref}`}
                          src={imageBuilder.image(image).width(34).height(34).url()}
                        />
                      }
                    >
                    </Button>
                  ) : (
                    <Button
                      style={{ cursor: 'pointer' }}
                      tone="primary"
                      icon={ImageIcon}
                      title={t('variants.coverImage.select')}
                      onClick={() => onCoverImageClick(variant._id)}
                    />
                  )}
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