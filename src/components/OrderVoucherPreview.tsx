import { OrderVoucher } from '../types'
import { useITSContext } from '../context/ITSCoreProvider'

import React, { useState } from 'react'
import { Card, Stack, Flex, Button, useToast } from '@sanity/ui'
import { usePaneRouter } from 'sanity/structure'
import { useClient } from 'sanity'
import {fromString as pathFromString} from '@sanity/util/paths'


export default function OrderVoucherPreview(props: OrderVoucher) {
  const {t, localizer, config: { apiVersion } } = useITSContext()
  const client = useClient({ apiVersion })
  const { voucherId, title } = props || {}
  const {routerPanesState, groupIndex, handleEditReference} = usePaneRouter();
  const [loading, setLoading] = useState(false)
  const toast = useToast()

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
        {localizer.value(title) || 'No title'}
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
