import { RocketLaunchIcon } from '@phosphor-icons/react'
import { Badge, Button, Card, Dialog, Flex, Spinner, Stack, Text, TextArea } from '@sanity/ui'
import { ChangeEvent, ReactElement, useCallback, useEffect, useMemo, useState } from 'react'

import { useITSContext } from '../context/ITSCoreProvider'
import { createNetlifyClient } from '../external/netlify'
import { NetlifyBuild } from '../types'

const getStatus = (build: NetlifyBuild | null): 'building' | 'ready' | 'error' | 'none' => {
  if (!build) return 'none'
  if (!build.done) return 'building'
  if (build.error) return 'error'
  return 'ready'
}

const statusTones: Record<string, 'positive' | 'caution' | 'critical' | 'default'> = {
  ready: 'positive',
  building: 'caution',
  error: 'critical',
}

export function DeployDialog(): ReactElement {
  const coreContext = useITSContext()
  const { t, config } = coreContext
  const reloadInterval = 10000
  const { accessToken, siteId, projectName } = config.integrations.netlify
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [build, setBuild] = useState<NetlifyBuild | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [title, setTitle] = useState('')

  const client = useMemo(() => {
    return createNetlifyClient(accessToken, siteId)
  }, [accessToken, siteId])

  const fetchBuild = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true)
      try {
        const latestBuilds = await client.getLatestBuilds()
        const latest = latestBuilds?.[0] || null
        setBuild(latest)
      } catch (err) {
        console.error(err)
      } finally {
        if (!isSilent) setLoading(false)
      }
    },
    [client],
  )

  useEffect(() => {
    const interval = open ? setInterval(() => fetchBuild(false), reloadInterval) : null

    if (open) fetchBuild()

    // Always returns a function, but only clears if the interval exists
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [open, fetchBuild, reloadInterval])

  const handleTrigger = useCallback(async () => {
    setActionLoading(true)
    try {
      // sleep for a second
      await client.triggerBuild(title ? title : t('deployments.dialog.defaultDeploymentTitle'))
      setTitle('')
      await fetchBuild()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }, [client, fetchBuild, title, t])

  const goToNetlify = useCallback(() => {
    window.open(
      `https://app.netlify.com/projects/${projectName}/deploys`,
      '_blank',
      'noopener noreferrer',
    )
  }, [projectName])

  const handleCancel = useCallback(async () => {
    if (!build?.deploy_id) return
    setActionLoading(true)
    try {
      await client.cancelDeploy(build.deploy_id)
      await fetchBuild()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }, [build, fetchBuild, client])
  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])

  const status = getStatus(build)

  const handleTitleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.currentTarget.value)
  }, [])

  const dialogContent = useMemo(() => {
    if (loading && !build) {
      return (
        <Flex align="center" justify="center" padding={4}>
          <Spinner muted />
        </Flex>
      )
    }

    if (!build) {
      return (
        <Text size={1} muted>
          {t('deployments.dialog.noInfos')}
        </Text>
      )
    }

    return (
      <>
        <Flex align="center" gap={3}>
          <Text size={2} weight="bold">
            {t('deployments.status.title')}
          </Text>
          <Badge padding={2} tone={statusTones[status] || 'default'}>
            {t(`deployments.status.options.${status}`)}
          </Badge>
          {status === 'building' && <Spinner muted />}
        </Flex>

        {build.error && (
          <Card tone="critical" padding={3} radius={2} border>
            <Text size={1}>{build.error}</Text>
          </Card>
        )}

        <Text size={1} muted>
          {t('deployments.startedOn')}{' '}
          {build.created_at
            ? coreContext.format.date(build.created_at, {
                dateStyle: 'medium',
                timeStyle: 'medium',
              })
            : '–'}
        </Text>

        {status !== 'building' && (
          <TextArea
            onChange={handleTitleChange}
            padding={3}
            rows={3}
            placeholder={t('ui.actions.optionalNote')}
            value={title}
          />
        )}
        <Stack>
          <Flex gap={3} justify="space-between">
            <Flex gap={3}>
              <Button
                text={t('deployments.dialog.actions.goToNetlify')}
                tone="default"
                onClick={goToNetlify}
              />
            </Flex>
            <Flex gap={3}>
              <Button
                text={t('deployments.dialog.actions.close')}
                mode="ghost"
                onClick={handleClose}
              />
              {status === 'building' ? (
                <Button
                  text={t('deployments.dialog.actions.cancel')}
                  tone="critical"
                  onClick={handleCancel}
                  loading={actionLoading}
                />
              ) : (
                <Button
                  text={t('deployments.dialog.actions.deploy')}
                  tone="primary"
                  onClick={handleTrigger}
                  loading={actionLoading || loading}
                  disabled={loading} // Prevent double clicks while silent fetching
                />
              )}
            </Flex>
          </Flex>
        </Stack>
      </>
    )
  }, [
    loading,
    build,
    status,
    t,
    actionLoading,
    title,
    handleTitleChange,
    goToNetlify,
    handleCancel,
    handleTrigger,
    handleClose,
    coreContext.format,
  ])

  return (
    <Stack>
      <Button icon={RocketLaunchIcon} title={t('deployments.title')} onClick={handleOpen} />

      {open && (
        <Dialog
          id="deploy-dialog"
          header={t('deployments.dialog.header')}
          onClose={handleClose}
          width={1}
        >
          <Card padding={4}>
            <Stack space={4}>{dialogContent}</Stack>
          </Card>
        </Dialog>
      )}
    </Stack>
  )
}
