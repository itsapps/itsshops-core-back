import { useSecrets } from '@sanity/studio-secrets'
import { Box, Button, Card, Dialog, Flex, Stack, Text, TextInput } from '@sanity/ui'
import { useToast } from '@sanity/ui/toast'
import { ChangeEvent, ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { useClient, useCurrentUser } from 'sanity'

import { HideIcon, IntegrationsIcon, ShowIcon } from '../assets/icons'
import { useITSContext } from '../context/ITSCoreProvider'
import { type ITSIntegrationSecrets, SECRETS_NAMESPACE } from '../types'

type SecretKey = keyof ITSIntegrationSecrets

function SecretField({
  id,
  title,
  description,
  value,
  disabled,
  onChange,
}: {
  id: string
  title: string
  description: string
  value: string
  disabled: boolean
  onChange: (next: string) => void
}): ReactElement {
  const { componentT } = useITSContext()
  const t = componentT.default
  const [visible, setVisible] = useState(false)
  const toggle = useCallback(() => setVisible((v) => !v), [])
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onChange(e.currentTarget.value),
    [onChange],
  )
  const descriptionId = `${id}-description`

  return (
    <Stack gap={2}>
      <Text as="label" htmlFor={id} size={1} weight="semibold">
        {title}
      </Text>
      <Text id={descriptionId} size={1} muted>
        {description}
      </Text>
      <TextInput
        id={id}
        // Masked until revealed: values show up in screen shares and over shoulders.
        type={visible ? 'text' : 'password'}
        autoComplete="off"
        spellCheck={false}
        data-1p-ignore
        data-lpignore="true"
        aria-describedby={descriptionId}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        suffix={
          <Box padding={1}>
            <Button
              mode="bleed"
              padding={2}
              icon={visible ? HideIcon : ShowIcon}
              title={visible ? t('integrations.hide') : t('integrations.show')}
              aria-label={`${visible ? t('integrations.hide') : t('integrations.show')}: ${title}`}
              aria-pressed={visible}
              aria-controls={id}
              onClick={toggle}
            />
          </Box>
        }
      />
    </Stack>
  )
}

/**
 * Toolbar button + dialog for the integration credentials in the secrets document (see
 * types/secrets.ts). Reads via `useSecrets`; writes the same document format as
 * `@sanity/studio-secrets` (`secrets.<namespace>`, type `pluginSecrets`, field `secrets`) itself,
 * because the package's `storeSecrets` swallows write errors. Not the package's `SettingsView`:
 * it can't mask values. Shown to administrators only — that only hides the UI: every logged-in
 * member can still read the document.
 */
export function IntegrationsDialog(): ReactElement | null {
  const { componentT, featureRegistry, config } = useITSContext()
  const t = componentT.default
  const toast = useToast()
  const user = useCurrentUser()
  const client = useClient({ apiVersion: config.apiVersion })
  const { loading, secrets } = useSecrets<ITSIntegrationSecrets>(SECRETS_NAMESPACE)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<ITSIntegrationSecrets>({})
  const [saving, setSaving] = useState(false)
  const vinofact = featureRegistry.isFeatureEnabled('shop.vinofact')

  // Fresh copy of the stored values each time the dialog opens.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the form on open / load
    if (open) setDraft(secrets ?? {})
  }, [open, secrets])

  const keys = useMemo<SecretKey[]>(
    () => [
      'functionsSecret',
      'netlifyBuildHook',
      ...(vinofact ? (['vinofactToken'] as const) : []),
    ],
    [vinofact],
  )

  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])
  const setValue = useCallback(
    (key: SecretKey) => (next: string) => setDraft((prev) => ({ ...prev, [key]: next })),
    [],
  )

  const handleSave = useCallback(async () => {
    const id = `secrets.${SECRETS_NAMESPACE}`
    // Keep keys this dialog doesn't show (e.g. vinofactToken while the feature is off); trim values.
    const next: ITSIntegrationSecrets = { ...secrets }
    for (const key of keys) next[key] = (draft[key] ?? '').trim()
    setSaving(true)
    try {
      await client
        .transaction()
        .createIfNotExists({ _id: id, _type: 'pluginSecrets' })
        .patch(id, (p) => p.set({ secrets: next }))
        .commit({ tag: 'secrets.store' })
      toast.push({ status: 'success', title: t('integrations.saved') })
      setOpen(false)
    } catch (err) {
      toast.push({
        status: 'error',
        title: t('integrations.saveFailed'),
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setSaving(false)
    }
  }, [client, draft, keys, secrets, t, toast])

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
        <Dialog
          id="integrations-dialog"
          header={t('integrations.dialogTitle')}
          onClose={handleClose}
          width={1}
        >
          <Card padding={4}>
            <Stack gap={4}>
              {keys.map((key) => (
                <SecretField
                  key={key}
                  id={`integrations-${key}`}
                  title={t(`integrations.keys.${key}.title`)}
                  description={t(`integrations.keys.${key}.description`)}
                  value={draft[key] ?? ''}
                  disabled={loading || saving}
                  onChange={setValue(key)}
                />
              ))}
              <Flex gap={3} justify="flex-end">
                <Button text={t('integrations.cancel')} mode="ghost" onClick={handleClose} />
                <Button
                  text={t('integrations.save')}
                  tone="primary"
                  onClick={handleSave}
                  loading={saving}
                  disabled={loading || saving}
                />
              </Flex>
            </Stack>
          </Card>
        </Dialog>
      )}
    </>
  )
}
