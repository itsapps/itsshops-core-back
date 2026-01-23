import type {PreviewProps} from 'sanity'
import {Flex, Text, Box} from '@sanity/ui'
import {extractYouTubeId} from '@helpers/helpers'
// import ReactPlayer from 'react-player'

export default function YoutubePreview(props: PreviewProps) {
  const title = props.title as string
  const videoId = extractYouTubeId(title)
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null

  // TODO: reintroduce react player if referrerPolicy is fixed?
  return (
    <Flex padding={3} direction="column">
      <Box padding={2}><Text>{"YouTube Video"}</Text></Box>
      {(embedUrl) &&
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
      }
    </Flex>
  )
}