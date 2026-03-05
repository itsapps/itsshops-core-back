import { Button, Card, Checkbox, Flex, Stack, Text } from '@sanity/ui'
import { fromString as pathFromString } from '@sanity/util/paths'
import React, { useEffect, useState } from 'react'
import { usePaneRouter } from 'sanity/structure'

import { useITSContext } from '../context/ITSCoreProvider'
import { ITSi18nArray } from '../types'
// import { OrderFreeProduct } from '../types'
import { LocaleImageView } from './LocaleImageView'

type ProductData = {
  _id: string
  _type: string
  sku: string
  title?: ITSi18nArray
  image?: any
}

export default function OrderFreeProductPreview(props: {
  item: any
  orderId: string
}): React.ReactElement {
  const { localizer, sanityClient } = useITSContext()

  const { productId, quantity, title } = props.item || {}
  const { routerPanesState, groupIndex, handleEditReference } = usePaneRouter()
  const [product, setProduct] = useState<ProductData | null>(null)
  const [packed, setPacked] = useState(props.item.packed || false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!productId) {
      return
    }

    const fetchData = async () => {
      const query = `
      *[_id == $productId][0]{
        _id,
        _type,
        title,
        sku,
        "images": coalesce(
          images,
          *[_type == "product" && references(^._id)][0].images
        )
      }
      `
      const data = await sanityClient.fetch(query, {
        productId: productId,
      })

      setProduct(data || null)
    }

    fetchData().catch((err) => {
      console.error('Failed to fetch product data:', err)
    })
  }, [productId, sanityClient])

  const handleClick = async (type: string, id: string) => {
    const childParams = routerPanesState[groupIndex + 1]?.[0].params || {}
    const { parentRefPath } = childParams

    handleEditReference({
      id: id,
      type: type,
      parentRefPath: parentRefPath ? pathFromString(parentRefPath) : [``],
      template: { id },
    })
  }

  const handleTitleClick = async () => {
    if (product) {
      handleClick(product._type, product._id)
    }
  }

  const displayTitle =
    localizer.objectValue(product, 'title') || localizer.value(title) || 'No title'

  const getImage = () => {
    if (!product) {
      return null
    }
    return product?.image
  }

  const image = getImage()
  const productButtonContent = (
    <Flex align={'center'} gap={2}>
      {image && <LocaleImageView image={image} options={{ width: 34 }} />}
      <Flex direction={'column'} gap={2}>
        <Text size={1}>{displayTitle}</Text>
        {product && (product.sku || props.item.sku) && (
          <Text size={3} weight="bold">
            {props.item.sku || product.sku}
          </Text>
        )}
      </Flex>
    </Flex>
  )

  const handleOrderItemPackedChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true)
    const newPacked = e.target.checked
    setPacked(newPacked)
    try {
      await sanityClient
        .patch(props.orderId)
        .set({ [`freeProducts[_key == "${props.item._key}"].packed`]: e.target.checked })
        .commit()
    } catch {
      setPacked(packed)
    }

    setLoading(false)
  }

  return (
    <Card padding={[1, 3]} radius={2} shadow={1}>
      <Flex
        align={['flex-start', 'flex-start', 'center']}
        justify={'space-between'}
        direction={['column', 'column', 'row']}
        gap={2}
      >
        <Stack space={2} padding={1}>
          <Flex direction="row" gap={2} align={'center'}>
            <Checkbox checked={packed} disabled={loading} onChange={handleOrderItemPackedChange} />
            <Text weight="semibold">{quantity}x</Text>
            <Button
              text={productButtonContent}
              mode="ghost"
              tone={'neutral'}
              onClick={handleTitleClick}
            />
          </Flex>
        </Stack>
      </Flex>
    </Card>
  )
}
