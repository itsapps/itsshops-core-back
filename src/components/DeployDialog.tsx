import { useSecrets } from '@sanity/studio-secrets'
import { Box, Button, Card, Dialog, Flex, Stack, Text, TextArea } from '@sanity/ui'
import { useToast } from '@sanity/ui/toast'
import { ChangeEvent, ReactElement, useCallback, useEffect, useId, useState } from 'react'

import { DeployIcon } from '../assets/icons'
import { useITSContext } from '../context/ITSCoreProvider'
import { type ITSIntegrationSecrets, SECRETS_NAMESPACE } from '../types'

const REFRESH_MS = 10000
/** Deploy stays disabled this long after a trigger (double clicks; the hook gives no build id). */
const COOLDOWN_MS = 10000

/**
 * Deploys the frontend through its Netlify **build hook** (secrets document, `netlifyBuildHook`) —
 * no Netlify token in the Studio: a hook can only start a build of one site/branch. The status is
 * Netlify's public deploy-status badge (an image; its state isn't readable from here, so there's no
 * "building" lock or cancel — details via "Netlify").
 */
export function DeployDialog(): ReactElement {
  const { componentT, config } = useITSContext()
  const t = componentT.default
  const toast = useToast()
  const { siteId, projectName } = config.integrations.netlify
  const { secrets } = useSecrets<ITSIntegrationSecrets>(SECRETS_NAMESPACE)
  const hook = secrets?.netlifyBuildHook ?? ''
  const titleId = useId()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [coolingDown, setCoolingDown] = useState(false)
  const [tick, setTick] = useState(() => Date.now())

  useEffect(() => {
    if (!open) return undefined
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fresh badge when the dialog opens
    setTick(Date.now())
    const interval = setInterval(() => setTick(Date.now()), REFRESH_MS)
    return () => clearInterval(interval)
  }, [open])

  useEffect(() => {
    if (!coolingDown) return undefined
    const timeout = setTimeout(() => setCoolingDown(false), COOLDOWN_MS)
    return () => clearTimeout(timeout)
  }, [coolingDown])

  const handleTrigger = useCallback(async () => {
    if (!hook) return
    setRequesting(true)
    const triggerTitle = title.trim() || t('deployments.dialog.defaultDeploymentTitle')
    try {
      const res = await fetch(`${hook}?trigger_title=${encodeURIComponent(triggerTitle)}`, {
        method: 'POST',
      })
      if (res.ok) {
        toast.push({ status: 'success', title: t('deployments.dialog.requested') })
        setTitle('')
        setCoolingDown(true)
        setTick(Date.now())
      } else {
        toast.push({
          status: 'error',
          title: t('deployments.dialog.requestFailed'),
          description: `${res.status} ${res.statusText}`.trim(),
        })
      }
    } catch (err) {
      toast.push({
        status: 'error',
        title: t('deployments.dialog.requestFailed'),
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setRequesting(false)
    }
  }, [hook, title, t, toast])

  const goToNetlify = useCallback(() => {
    window.open(
      `https://app.netlify.com/projects/${projectName}/deploys`,
      '_blank',
      'noopener noreferrer',
    )
  }, [projectName])

  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])
  const handleTitleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.currentTarget.value)
  }, [])

  return (
    <Stack>
      <Button
        icon={DeployIcon}
        title={t('deployments.title')}
        aria-label={t('deployments.title')}
        onClick={handleOpen}
      />

      {open && (
        <Dialog
          id="deploy-dialog"
          header={t('deployments.dialog.header')}
          onClose={handleClose}
          width={1}
        >
          <Card padding={4}>
            <Stack gap={4}>
              {siteId && (
                <Stack gap={2}>
                  <Flex align="center" gap={3}>
                    <Text size={2} weight="bold">
                      {t('deployments.status.title')}
                    </Text>
                    <img
                      src={`https://api.netlify.com/api/v1/badges/${encodeURIComponent(siteId)}/deploy-status?t=${tick}`}
                      alt={t('deployments.dialog.statusAlt')}
                      height={20}
                    />
                  </Flex>
                  <Text size={1} muted>
                    {t('deployments.dialog.statusHint')}
                  </Text>
                </Stack>
              )}

              {hook ? (
                <Stack gap={2}>
                  <Text as="label" htmlFor={titleId} size={1} weight="medium">
                    {t('deployments.dialog.titleLabel')}
                  </Text>
                  <TextArea
                    id={titleId}
                    onChange={handleTitleChange}
                    padding={3}
                    rows={3}
                    value={title}
                  />
                </Stack>
              ) : (
                <Card tone="caution" padding={3} radius={2} border>
                  <Text size={1}>{t('deployments.dialog.noHook')}</Text>
                </Card>
              )}

              <Flex gap={3} justify="space-between">
                <Box>
                  {projectName && (
                    <Button
                      text={t('deployments.dialog.actions.goToNetlify')}
                      tone="default"
                      onClick={goToNetlify}
                    />
                  )}
                </Box>
                <Flex gap={3}>
                  <Button
                    text={t('deployments.dialog.actions.close')}
                    mode="ghost"
                    onClick={handleClose}
                  />
                  <Button
                    text={t('deployments.dialog.actions.deploy')}
                    tone="primary"
                    onClick={handleTrigger}
                    loading={requesting}
                    disabled={!hook || requesting || coolingDown}
                  />
                </Flex>
              </Flex>
            </Stack>
          </Card>
        </Dialog>
      )}
    </Stack>
  )
}
