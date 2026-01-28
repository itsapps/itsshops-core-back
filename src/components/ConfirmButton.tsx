import { useITSContext } from '../context/ITSCoreProvider'

import React, { useState, ButtonHTMLAttributes } from 'react';
import { Button, Dialog, Flex, Stack, Text, ButtonProps } from '@sanity/ui';

type ConfirmButtonProps = {
  onConfirm: () => void;
  confirmText: string;
  confirmDescription?: string | null;
} & ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function ConfirmButton(
  { onConfirm, confirmText, confirmDescription=null, ...buttonProps }: ConfirmButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {t} = useITSContext()

  const { onClick: _originalOnClick, style, ...restOfProps } = buttonProps;

  const handleConfirm = () => {
    onConfirm(); // Execute the confirm action
    setIsDialogOpen(false); // Close the dialog
  };

  return (
    <>
      {/* Main button */}
      <Button {...restOfProps} style={style as any} onClick={() => setIsDialogOpen(true)} />

      {/* Confirmation popup */}
      {isDialogOpen && (
        <Dialog
          id="confirm-dialog"
          header={confirmText}
          zOffset={1000} // Ensures the dialog appears above other UI
          onClose={() => setIsDialogOpen(false)}
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
                <Button tone="critical" text={t('ui.dialog.confirm')} onClick={handleConfirm} />
                <Button tone="default" mode="ghost" text={t('ui.dialog.cancel')} onClick={() => setIsDialogOpen(false)} />
              </Flex>
            </Stack>
          </Flex>
        </Dialog>
      )}
    </>
  );
}
