import { useEffect } from 'react'
import { useITSContext } from '../context/ITSCoreProvider'

import { type UserViewComponent } from 'sanity/structure'
import { type SanityDocument } from 'sanity'
import { Dialog, Button, Flex, Stack, Box, Card, Text, Heading, useToast } from '@sanity/ui'
import { useState } from 'react'

interface Customer extends SanityDocument {
  email?: string
}
interface CustomerGroup extends SanityDocument {
  items: any[]
}
export const CustomerGroupView: UserViewComponent = (props) => {
  const { t, format, sanityClient } = useITSContext();

  // const {document} = props.published
  const document = props.document.displayed
  const [customers, setCustomers] = useState<Customer[]>([])

  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const toast = useToast()

  useEffect(() => {
    setLoading(true)
    
    const query = `*[_type == "customer" && $groupId in customerGroups[]._ref]{_id, email}`
    sanityClient.fetch(query, {groupId: document._id}).then((data) => {
      setCustomers(data || [])
    })
    .catch((err) => {
      console.log(err.message || 'Failed to fetch wines from Vinofact.')
    })
    .finally(() => setLoading(false))
  }, [sanityClient, document._id])


  return (
    <Box padding={[2, 3]}>
      <Stack space={[2, 3]}>
        <Flex align="center" gap={3}>
          <Text weight='medium'>
            {`Customers`}
          </Text>
        </Flex>
        <Stack marginTop={4} space={2}>
          <Box padding={2}>
            <Heading as="h3">
              {t('customerGroup.items')}
            </Heading>
          </Box>
          {customers.map((item, index) => (
              <div key={index}>{item.email}</div>
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}