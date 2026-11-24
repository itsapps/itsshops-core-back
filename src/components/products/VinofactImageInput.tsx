/**
 * Input of a wine variant's `image`: the normal image input plus a button that copies the wine's
 * VinoFact bottle image into it (one-off copy; afterwards an ordinary Sanity image). Writes through
 * the form (`onChange`), so the change lands in the draft like any edit. Existing alt texts are
 * kept, VinoFact's alt fills only empty locales (core-front plan `vinofact-bottle-image-import.md`,
 * D11).
 */
import { Box, Button, Card, Dialog, Flex, Stack, Text } from '@sanity/ui'
import { useToast } from '@sanity/ui/toast'
import { ReactElement, useCallback, useId, useRef, useState } from 'react'
import { type ObjectInputProps, set, useFormValue } from 'sanity'

import { useITSContext } from '../../context/ITSCoreProvider'
import {
  bottleImageUrl,
  buildLocaleAltImage,
  fetchBottleImage,
  uploadBottleImage,
} from '../../lib/shop/vinofactImage'
import type { LocaleAltImage } from '../../types/sanity.types'

export function VinofactImageInput(props: ObjectInputProps<LocaleAltImage>): ReactElement {
  const { vinofactClient, sanityClient, componentT, config } = useITSContext()
  const t = componentT.default
  const toast = useToast()
  const kind = useFormValue(['kind']) as string | undefined
  const wineId = useFormValue(['wine', 'vinofactWineId']) as string | undefined
  const [running, setRunning] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dialogId = useId()

  const { onChange, value, readOnly } = props
  const hasImage = !!value?.asset
  const existingAlt = value?.alt
  const { fieldLocales } = config.localization

  const runImport = useCallback(async () => {
    if (!wineId) return
    if (!vinofactClient) {
      toast.push({
        status: 'error',
        title: t('vinofact.notInitialized.title'),
        description: t('vinofact.notInitialized.description'),
      })
      return
    }
    const locales = fieldLocales
    setRunning(true)
    try {
      const { wines } = await vinofactClient.getBottleImages([wineId], locales)
      const img = wines.find((w) => String(w.id) === String(wineId))?.bottleImage
      if (!img) {
        toast.push({
          status: 'info',
          title: t('vinofact.bottleImage.noImage'),
          description: t('vinofact.bottleImage.noImageDescription'),
        })
        return
      }
      const blob = await fetchBottleImage(img)
      const assetId = await uploadBottleImage(sanityClient, blob, {
        wineId,
        url: bottleImageUrl(img),
      })
      // The whole value is replaced: an old crop/hotspot belongs to the old image.
      onChange(set(buildLocaleAltImage(assetId, img.alt, locales, existingAlt)))
      toast.push({ status: 'success', title: t('vinofact.bottleImage.imported') })
    } catch (err) {
      toast.push({
        status: 'error',
        title: t('vinofact.bottleImage.failed'),
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setRunning(false)
    }
  }, [wineId, vinofactClient, fieldLocales, sanityClient, onChange, existingAlt, toast, t])

  const closeConfirm = useCallback(() => {
    setConfirmOpen(false)
    buttonRef.current?.focus()
  }, [])

  const handleClick = useCallback(() => {
    if (hasImage) setConfirmOpen(true)
    else runImport()
  }, [hasImage, runImport])

  const handleConfirm = useCallback(() => {
    closeConfirm()
    runImport()
  }, [closeConfirm, runImport])

  const showButton = kind === 'wine' && !!wineId

  return (
    <Stack gap={3}>
      {props.renderDefault(props)}
      {showButton && (
        <Box aria-busy={running}>
          <Button
            ref={buttonRef}
            mode="ghost"
            text={t(hasImage ? 'vinofact.bottleImage.reimport' : 'vinofact.bottleImage.import')}
            loading={running}
            disabled={running || readOnly}
            onClick={handleClick}
          />
        </Box>
      )}
      {confirmOpen && (
        <Dialog
          id={dialogId}
          header={t('vinofact.bottleImage.confirm.title')}
          onClose={closeConfirm}
          width={1}
        >
          <Card padding={4}>
            <Stack gap={4}>
              <Text size={1}>{t('vinofact.bottleImage.confirm.text')}</Text>
              <Flex gap={3} justify="flex-end">
                <Button
                  mode="ghost"
                  text={t('vinofact.bottleImage.confirm.cancel')}
                  onClick={closeConfirm}
                />
                <Button
                  tone="primary"
                  text={t('vinofact.bottleImage.confirm.confirm')}
                  onClick={handleConfirm}
                />
              </Flex>
            </Stack>
          </Card>
        </Dialog>
      )}
    </Stack>
  )
}
