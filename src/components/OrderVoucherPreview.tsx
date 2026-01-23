
import React, { useState } from 'react'
import { Card, Stack, Flex, Button } from '@sanity/ui'
import { usePaneRouter } from 'sanity/structure'
import { useClient, useCurrentLocale, useTranslation } from 'sanity'
import {fromString as pathFromString} from '@sanity/util/paths'
import {apiVersion} from '@helpers/globals'
import {localizedValue} from '@helpers/utils'
import { OrderVoucher } from '@typings/models'
import {useToast} from '@sanity/ui'


export default function OrderVoucherPreview(props: OrderVoucher) {
  const client = useClient({ apiVersion })
  const locale = useCurrentLocale().id.substring(0, 2)
  const { voucherId, title } = props || {}
  const {routerPanesState, groupIndex, handleEditReference} = usePaneRouter();
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const {t} = useTranslation('itsapps')

  const handleClick = async () => {
    setLoading(true)
    const data = await client.fetch(
      `*[_type == "voucher" && _id == $voucherId][0]{_id, title}`, {
        voucherId,
      }
    )
    setLoading(false)

    if (data) {
      const childParams = routerPanesState[groupIndex + 1]?.[0].params || {}
      const {parentRefPath} = childParams

      handleEditReference({
        id: data._id,
        type: "voucher",
        parentRefPath: parentRefPath ? pathFromString(parentRefPath) : [``],
        template: {id: data._id},
      })
    } else {
      toast.push({
        status: 'error',
        title: t('order.voucher.notFound'),
      })
    }
  }

  const buttonContent = (
    <Flex align={'center'} gap={2}>
      <span style={{whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis'}}>
        {localizedValue(title, locale) || 'No title'}
      </span>
    </Flex>
  )

  return (
    <Card padding={[1, 3]} radius={2} shadow={1}>
      <Flex align={['flex-start', 'flex-start', 'center']} justify={'space-between'} direction={['column', 'column', 'row']} gap={2}>
        <Stack space={2} padding={1}>
          <Flex direction="row" gap={2} align={'center'}>
            <Button loading={loading} disabled={loading} text={buttonContent} mode="ghost" tone={'neutral'} onClick={handleClick} />
          </Flex>
        </Stack>
      </Flex>
    </Card>
  )
}
