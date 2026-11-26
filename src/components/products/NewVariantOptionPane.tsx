import { Flex, Spinner } from '@sanity/ui'
import { useEffect } from 'react'
import { usePaneRouter, type UserComponent } from 'sanity/structure'

/**
 * "New option" in an option group's list: replaces itself with a new option's editor — a fresh
 * id in the route, the group template in the pane params (as an intent would set them), so the
 * document is only created on the first edit and the editor survives the list updating. A
 * `create` intent can't be used: its global resolution never reaches the group's pane.
 */
export const NewVariantOptionPane: UserComponent = ({ options }) => {
  const { replaceCurrent } = usePaneRouter()
  const groupId = typeof options?.groupId === 'string' ? options.groupId : null

  useEffect(() => {
    if (!groupId) return
    replaceCurrent({
      id: crypto.randomUUID(),
      params: { type: 'variantOption', template: 'variantOption-by-group' },
      payload: { groupId },
    })
  }, [groupId, replaceCurrent])

  return (
    <Flex align="center" justify="center" padding={5}>
      <Spinner muted />
    </Flex>
  )
}
