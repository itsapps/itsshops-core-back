import { Box, Flex, Heading, Stack, Text, useToast } from '@sanity/ui'
import { useEffect } from 'react'
import { useState } from 'react'
import { type SanityDocument } from 'sanity'
import { type UserViewComponent } from 'sanity/structure'

import { useITSContext } from '../context/ITSCoreProvider'

interface Customer extends SanityDocument {
  email?: string
}
// interface CustomerGroup extends SanityDocument {
//   items: any[]
// }
export const CustomerGroupView: UserViewComponent = (props) => {
  const { t, sanityClient } = useITSContext()

  // const {document} = props.published
  const document = props.document.displayed
  const [customers, setCustomers] = useState<Customer[]>([])

  // const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    const query = `*[_type == "customer" && $groupId in customerGroups[]._ref]{_id, email}`
    sanityClient
      .fetch(query, { groupId: document._id })
      .then((data) => {
        setCustomers(data || [])
      })
      .catch((err) => {
        toast.push({
          status: 'error',
          title: err.message || 'Failed to fetch wines from Vinofact.',
        })
      })
  }, [sanityClient, document._id, toast])

  return (
    <Box padding={[2, 3]}>
      <Stack space={[2, 3]}>
        <Flex align="center" gap={3}>
          <Text weight="medium">{`Customers`}</Text>
        </Flex>
        <Stack marginTop={4} space={2}>
          <Box padding={2}>
            <Heading as="h3">{t('customerGroup.items')}</Heading>
          </Box>
          {customers.map((item) => (
            <div key={item._id}>{item.email}</div>
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}