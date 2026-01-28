import { ITSi18nImage } from '../types'
import { useITSContext } from '../context/ITSCoreProvider'
import React from 'react';
import {Box, Button, Flex, Dialog, Spinner, Card} from '@sanity/ui'
import { TrashIcon } from '@sanity/icons'
import imageUrlBuilder from '@sanity/image-url'
import {useClient} from 'sanity'

// import {LocaleImage} from '@typings/models'

type Props = {
  images: ITSi18nImage[]
  value: string
  onSubmit: (image: string) => void
  onRemove: () => void
  onCancel: () => void
  loading: boolean
}

export const CoverImageDialog = ({ images, value, onSubmit, onRemove, onCancel, loading }: Props) => {
  const { t, helpers, apiVersion } = useITSContext();
  const client = useClient({apiVersion})
  const imageBuilder = imageUrlBuilder(client)

  if (images.length == 0) {
    return <p>No images uploaded yet.</p>;
  }

  return (
    <Dialog
      header={t('variants.coverImage.select')}
      id="cover-image-variant-dialog"
      onClose={onCancel}
      width={1}
      footer={
        <Card paddingTop={3}>
        </Card>
      }
    >
      <Card style={{ position: 'relative' }}>
        <Flex direction={"column"} padding={4} gap={1}>
          <Flex gap={1} wrap={"wrap"}>
            {images.filter((img) => img.asset).map((img, index) => (
              <Box key={index}>
                <Button
                  key={img.asset._ref}
                  type="button"
                  onClick={() => onSubmit(img.asset._ref)}
                  mode="ghost"
                  style={{
                    border: value === img.asset._ref ? '2px solid blue' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={imageBuilder.image(img).width(44).height(44).url()}
                    alt={`${index + 1}`}
                    width={50}
                    height={50}
                  />
                </Button>
              </Box>
            ))}
          </Flex>
          <Button
            icon={TrashIcon}
            tone="critical"
            onClick={() => onRemove()}
            text={t('variants.coverImage.remove')}
            disabled={!value}
          />
        </Flex>
        {loading && (
        <Card
          tone="transparent"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)', // Optional semi-transparent background
            zIndex: 10, // Ensures it stays above the content
          }}
        >
          <Spinner size={4} muted />
        </Card>
      )}
      </Card>
    </Dialog>
  );
}
