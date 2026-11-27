import { Card, Text } from '@sanity/ui'
import type { UserComponent } from 'sanity/structure'

/**
 * Shown instead of a document's own list (product + variants, option group + options) once the
 * document is gone: its list item would otherwise stay as a "Missing document" whose editor
 * creates a new document with the old id. `options.text`: the translated notice.
 */
export const DeletedDocumentPane: UserComponent = ({ options }) => (
  <Card padding={4}>
    <Card padding={3} radius={2} tone="caution" border>
      <Text size={1}>{typeof options?.text === 'string' ? options.text : ''}</Text>
    </Card>
  </Card>
)
