import { useITSContext } from '../../context/ITSCoreProvider'
import { Order, SendMailType, SendMailTypes } from '../../types'

import { useState, useMemo } from 'react'
import { Flex, Box, Text, Button } from '@sanity/ui'
import {
  DocumentActionDescription,
  DocumentActionProps,
} from 'sanity'
import {EnvelopeIcon} from '@sanity/icons'


export function OrderMailAction(props: DocumentActionProps): DocumentActionDescription {
  const { t } = useITSContext();
  const [dialogOpen, setDialogOpen] = useState(false)
  const { published, draft } = props
  const order = useMemo(() => (draft || published) as Order | null, [draft, published])
  const disabled = !order
  
  return {
    label: t('actions.order.sendMail'),
    disabled,
    ...!disabled && {
      onHandle: () => {
        setDialogOpen(true)

        // props.onComplete()
      },
      icon: EnvelopeIcon,
      dialog: dialogOpen && {
        type: 'dialog',
        header: t('actions.order.sendMail'),
        onClose: () => setDialogOpen(false),
        content: (
          <OrderMailDialogContent order={order}/>
        ),
      }
    }
  }
}

function OrderMailDialogContent({order}: {order: Order | null}) {
  const {t,  frontendClient } = useITSContext();
  const [loading, setLoading] = useState('')
  const [status, setStatus] = useState(' ')

  const sendMail = async (type: SendMailType) => {
    setLoading(type)
    setStatus('')

    const result = await frontendClient.sendMail(type, order!._id)
    
    if (result.error) {
      setStatus(t('actions.order.error', {errorMessage: result.error}))
    } else {
      setStatus(t('actions.order.sendMailSuccess'))
    }

    setLoading('')
  }

  return (
    <Box>
      <Flex gap={3} direction={'column'} align={'center'} marginBottom={3}>
        {Object.values(SendMailTypes).filter((value) => value !== SendMailTypes.ORDER_REFUNDED_PARTIALLY).map((value) => (
          <Button
            key={value}
            text={t(`actions.order.mailTypes.${value}`)}
            disabled={loading !== ''}
            loading={loading === value}
            onClick={() => sendMail(value as SendMailType)}
          />
        ))}
      </Flex>
      <Box marginTop={3}>
        <Text>{status}</Text>
      </Box>
    </Box>
  )
}
