import { OrderItem, OrderBundleItem, ITSi18nArray } from '../types'
import { useITSContext } from '../context/ITSCoreProvider'

import React, { useEffect, useState } from 'react'
import imageUrlBuilder from '@sanity/image-url'
import { Inline, Card, Stack, Flex, Button, Text, Checkbox } from '@sanity/ui'
import { usePaneRouter } from 'sanity/structure'
import { useClient } from 'sanity'
import {fromString as pathFromString} from '@sanity/util/paths'

type ProductData = {
  _id: string
  productNumber: string
  title?: ITSi18nArray
  images?: any[]
}
type ProductVariantData = ProductData & {
  coverImage: string
}


export default function OrderItemPreview(props: {item: (OrderItem | OrderBundleItem), orderId: string}) {
  const { localizer, format, config: { apiVersion, shop } } = useITSContext();
  const client = useClient({ apiVersion })

  const imageBuilder = imageUrlBuilder(client)
  const { type, productId, parentId, quantity, price, title } = props.item || {}
  const [packed, setPacked] = useState(props.item.packed || false)
  const [loading, setLoading] = useState(false)
  const isBundleProduct = type == shop.productTypes.bundle
  const {routerPanesState, groupIndex, handleEditReference} = usePaneRouter();
  const [product, setProduct] = useState<ProductData | null>(null)
  const [variant, setVariant] = useState<ProductVariantData | null>(null)
  const isVariant = !!parentId

  useEffect(() => {
    if (!productId) {
      return
    }

    const fetchData = async () => {
      if (isVariant) {
        const data = await client.fetch(
          `{
            "variant": *[_type == "productVariant" && _id == $variantId][0]{_id, productNumber, title, images, coverImage},
            "product": *[_type == "product" && _id == $productId][0]{_id, productNumber, title, images}
          }`,
          {
            variantId: productId,
            productId: parentId,
          }
        )
  
        setVariant(data?.variant || null)
        setProduct(data?.product || null)
      }
      else {
        const data = await client.fetch(
          `*[_type == "product" && _id == $productId][0]{_id, productNumber, title, images}`,
          {
            productId: productId,
          }
        )
  
        setProduct(data || null)
      }
    }

    fetchData().catch((err) => {
      console.error('Failed to fetch product data:', err)
    })
  }, [isBundleProduct, productId, parentId, isVariant, client])

  const handleTitleClick = async () => {
    if (variant) {
      handleClick("productVariant", variant._id)
    } else if (product) {
      handleClick("product", product._id)
    }
  }

  const handleClick = async (type: string, id: string) => {
    const childParams = routerPanesState[groupIndex + 1]?.[0].params || {}
    const {parentRefPath} = childParams

    handleEditReference({
      id: id,
      type: type,
      parentRefPath: parentRefPath ? pathFromString(parentRefPath) : [``],
      template: {id: id},
    })
  }

  const displayTitle = (localizer.objectValue(variant, 'title') ||
    localizer.objectValue(product, 'title') ||
    localizer.value(title) || 'No title')

  const getImage = () => {
    if (!product && !variant) {
      return null
    }
    if (isVariant && variant) {
      const coverImageAssetRef = variant.coverImage
      if (coverImageAssetRef) {
        const productImages = product?.images || []
        const image = coverImageAssetRef && productImages.find(image => image.asset?._ref === coverImageAssetRef)
        return image
      }
      if ((variant.images || []).length > 0) {
        return variant?.images?.[0]
      }
    }
    return product?.images?.[0]
  }

  let optionGroups: Array<{group: string, title: string}> = []
  if (!isBundleProduct) {
    const variantProps = props.item as OrderItem
    optionGroups = isBundleProduct ? [] : (variantProps.options || []).map((option) => {
      const groupTitle = localizer.objectValue(option, 'group') || 'No group'
      const optionTitle = localizer.objectValue(option, 'title') || 'No title'
      return {group: groupTitle, title: optionTitle}
    })
  }
  let bundleItems: Array<{count: number, title: string}> = []
  if (isBundleProduct) {
    const bundleProps = props.item as OrderBundleItem
    bundleItems = !isBundleProduct ? [] : (bundleProps.items || []).map((item) => {
      return {count: item.count, title: localizer.objectValue(item, 'title') || 'No title'}
    })
  }

  const image = getImage()
  const productButtonContent = (
    <Flex align={'center'} gap={2}>
      {image && (
        <img
          src={imageBuilder.image(image).width(34).height(34).url()}
          alt="preview"
          style={{width: '34px', height: '34px', objectFit: 'cover'}}
        />
      )}
      <Flex direction={'column'} gap={2}>
        <Text size={1}>{displayTitle}</Text>
        {((product && product.productNumber) || (variant && variant.productNumber) || props.item.productNumber) && <Text size={3} weight='bold'>{props.item.productNumber || variant?.productNumber || product?.productNumber}</Text>}
      </Flex>
    </Flex>
  )
  
  const handleOrderItemPackedChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true)
    const newPacked = e.target.checked
    setPacked(newPacked)
    try {
      await client.patch(props.orderId)
      .set({[`items[_key == "${props.item._key}"].packed`]: e.target.checked})
      .commit()
    } catch {
      setPacked(packed)
    }
    
    setLoading(false)
  }

  return (
    <Card padding={[1, 3]} radius={2} shadow={1}>
      <Flex align={['flex-start', 'flex-start', 'center']} justify={'space-between'} direction={['column', 'column', 'row']} gap={2}>
        <Stack space={2} padding={1}>
          <Flex direction="row" gap={2} align={'center'}>
            <Checkbox checked={packed} disabled={loading} onChange={handleOrderItemPackedChange} />
            <Text weight='semibold'>{quantity}x</Text>
            <Button text={productButtonContent} mode="ghost" tone={'neutral'} onClick={handleTitleClick} />
          </Flex>
        </Stack>
      </Flex>
        <Flex gap={2} justify={'space-between'} direction={'row'} align={'flex-end'}>
          <Stack space={2} padding={1}>
            {!isBundleProduct ? (
              optionGroups.map((item, index) => (
                <Inline key={index} space={2}>
                <Text weight='semibold' size={1}>
                  {item.group}:
                </Text>
                <Text size={1}>
                  {item.title}
                </Text>
                </Inline>
              ))  
            ) : (
              (bundleItems || []).map((item, index) => (
                <Inline key={index} space={2}>
                <Text weight='semibold' size={1}>
                  {item.count} X
                </Text>
                <Text size={1}>
                  {item.title}
                </Text>
                </Inline>
              ))
            )}
            
          </Stack>    
          <Text align={'right'}>{format.currency(price*quantity/100)}</Text>
        </Flex>
    </Card>
  )
}
