import { Button, ButtonProps, Dialog, Flex, Stack, Text } from '@sanity/ui'
import { ButtonHTMLAttributes, useCallback, useState } from 'react'

import { useITSContext } from '../context/ITSCoreProvider'

type ConfirmButtonProps = {
  onConfirm: () => void
  confirmText: string
  confirmDescription?: string | null
} & ButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement>

export function ConfirmButton({
  onConfirm,
  confirmText,
  confirmDescription = null,
  ...buttonProps
}: ConfirmButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { t } = useITSContext()

  const { style, ...restOfProps } = buttonProps

  const handleOpen = useCallback(() => setIsDialogOpen(true), [])

  const handleClose = useCallback(() => setIsDialogOpen(false), [])

  const handleConfirm = useCallback(() => {
    onConfirm()
    setIsDialogOpen(false)
  }, [onConfirm])

  return (
    <>
      {/* Main button */}
      <Button {...restOfProps} style={style as any} onClick={handleOpen} />

      {/* Confirmation popup */}
      {isDialogOpen && (
        <Dialog
          id="confirm-dialog"
          header={confirmText}
          zOffset={1000} // Ensures the dialog appears above other UI
          onClose={handleClose}
          width={1} // Full-width dialog (adjust as needed)
        >
          <Flex padding={4} direction="column" align="center" justify="center">
            <Stack space={4}>
              {confirmDescription && (
                <Text size={2} align="center">
                  {confirmDescription}
                </Text>
              )}
              <Flex gap={3} justify="center">
                <Button
                  tone="critical"
                  text={t.default('ui.dialog.confirm')}
                  onClick={handleConfirm}
                />
                <Button
                  tone="default"
                  mode="ghost"
                  text={t.default('ui.dialog.cancel')}
                  onClick={handleClose}
                />
              </Flex>
            </Stack>
          </Flex>
        </Dialog>
      )}
    </>
  )
}
