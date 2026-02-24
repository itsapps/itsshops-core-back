import { Box, Flex, Text } from '@sanity/ui'
import { ReactElement } from 'react'
import type { PreviewProps } from 'sanity'

import { extractYouTubeId } from '../utils'

export default function YoutubePreview(props: PreviewProps): ReactElement {
  const title = props.title as string
  const videoId = extractYouTubeId(title)
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null

  return (
    <Flex padding={3} direction="column">
      <Box padding={2}>
        <Text>{'YouTube Video'}</Text>
      </Box>
      {embedUrl && (
        <iframe
          width="100%"
          height="200"
          src={embedUrl}
          title="YouTube video preview"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          style={{
            border: 0,
            borderRadius: '8px',
            width: '100%',
            height: '200px',
          }}
        />
      )}
    </Flex>
  )
}