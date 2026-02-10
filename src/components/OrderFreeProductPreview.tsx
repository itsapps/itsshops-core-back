import { ITSi18nArray } from '../types'
import { useITSContext } from '../context/ITSCoreProvider'
import React, { useEffect, useState } from 'react'
import imageUrlBuilder from '@sanity/image-url'
import { Card, Stack, Flex, Button, Text, Checkbox } from '@sanity/ui'
import { usePaneRouter } from 'sanity/structure'
import { useClient } from 'sanity'
import {fromString as pathFromString} from '@sanity/util/paths'

import { OrderFreeProduct } from '../types'

type ProductData = {
  _id: string
  _type: string
  sku: string
  title?: ITSi18nArray
  images?: any[]
}

export default function OrderFreeProductPreview(props: {item: OrderFreeProduct, orderId: string}) {
  const { localizer, config: { apiVersion } } = useITSContext();
  const client = useClient({apiVersion})

  const imageBuilder = imageUrlBuilder(client)
  const { productId, quantity, title } = props.item || {}
  const {routerPanesState, groupIndex, handleEditReference} = usePaneRouter();
  const [product, setProduct] = useState<ProductData | null>(null)
  const [packed, setPacked] = useState(props.item.packed || false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!productId) {
      return
    }

    const fetchData = async () => {
      const data = await client.fetch(
        `*[_id == $productId][0]{
          _id,
          _type,
          title,
          sku,
          "images": coalesce(
            images,
            *[_type == "product" && references(^._id)][0].images
          )
        }`, {
          productId: productId,
        }
      )

      setProduct(data || null)
    }

    fetchData().catch((err) => {
      console.error('Failed to fetch product data:', err)
    })
  }, [productId, client])

  const handleTitleClick = async () => {
    if (product) {
      handleClick(product._type, product._id)
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

  const displayTitle = 
    localizer.objectValue(product, 'title') ||
    localizer.value(title) ||
    'No title'

  const getImage = () => {
    if (!product) {
      return null
    }
    return product?.images?.[0]
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
        {(product && (product.sku || props.item.sku)) && <Text size={3} weight='bold'>{props.item.sku || product.sku}</Text>}
      </Flex>
    </Flex>
  )

  const handleOrderItemPackedChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true)
    const newPacked = e.target.checked
    setPacked(newPacked)
    try {
      await client.patch(props.orderId)
      .set({[`freeProducts[_key == "${props.item._key}"].packed`]: e.target.checked})
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
    </Card>
  )
}
