import { SettingsView } from '@sanity/studio-secrets'
import { Button } from '@sanity/ui'
import { ReactElement, useCallback, useMemo, useState } from 'react'
import { useCurrentUser } from 'sanity'

import { IntegrationsIcon } from '../assets/icons'
import { useITSContext } from '../context/ITSCoreProvider'
import { SECRETS_NAMESPACE } from '../types'

/**
 * Toolbar button + `@sanity/studio-secrets` dialog for the integration credentials (secrets
 * document, see types/secrets.ts). Shown to administrators only — that only hides the UI: every
 * logged-in member can still read the document.
 */
export function IntegrationsDialog(): ReactElement | null {
  const { componentT, featureRegistry } = useITSContext()
  const t = componentT.default
  const user = useCurrentUser()
  const [open, setOpen] = useState(false)
  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])
  const vinofact = featureRegistry.isFeatureEnabled('shop.vinofact')

  const keys = useMemo(
    () => [
      {
        key: 'functionsSecret',
        title: t('integrations.keys.functionsSecret.title'),
        description: t('integrations.keys.functionsSecret.description'),
      },
      {
        key: 'netlifyBuildHook',
        title: t('integrations.keys.netlifyBuildHook.title'),
        description: t('integrations.keys.netlifyBuildHook.description'),
      },
      ...(vinofact
        ? [
            {
              key: 'vinofactToken',
              title: t('integrations.keys.vinofactToken.title'),
              description: t('integrations.keys.vinofactToken.description'),
            },
          ]
        : []),
    ],
    [t, vinofact],
  )

  if (!user?.roles.some((role) => role.name === 'administrator')) return null

  return (
    <>
      <Button
        icon={IntegrationsIcon}
        title={t('integrations.title')}
        aria-label={t('integrations.title')}
        onClick={handleOpen}
      />
      {open && (
        <SettingsView
          title={t('integrations.dialogTitle')}
          namespace={SECRETS_NAMESPACE}
          keys={keys}
          onClose={handleClose}
        />
      )}
    </>
  )
}
