import React, { useEffect, useState } from 'react'
import {
  Button,
  Dialog,
  Card,
  Stack,
  Text,
  Flex,
  Spinner,
  Badge,
  TextArea,
} from "@sanity/ui"
import {
  useTranslation,
  useCurrentLocale,
} from 'sanity'
import {RocketLaunch} from 'phosphor-react'

import { useNetlifyClient, NetlifyBuild } from '../hooks/useNetlifyClient'
import { formatDate } from '../utils'

const getStatus = (build: NetlifyBuild | null): "building" | "ready" | "error" | "none" => {
  if (!build) return "none"
  if (!build.done) return "building"
  if (build.error) return "error"
  return "ready"
}

export function DeployDialog() {
  const {t} = useTranslation('itsapps')
  const locale = useCurrentLocale().id.substring(0, 2)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [build, setBuild] = useState<NetlifyBuild | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const client = useNetlifyClient()
  const [title, setTitle] = useState('')

  const fetchBuild = async () => {
    setLoading(true)
    try {
      const latestBuilds = await client.getLatestBuilds()
      const latest = latestBuilds?.[0] || null
      setBuild(latest)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleTrigger = async () => {
    setActionLoading(true)
    try {
      await client.triggerBuild(title ? title : t('deployments.dialog.defaultDeploymentTitle'))
      await fetchBuild()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
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
  }

  useEffect(() => {
    if (open) {
      fetchBuild()
      const interval = setInterval(fetchBuild, 10000) // poll while dialog is open
      return () => clearInterval(interval)
    }
  }, [open])

  const status = getStatus(build)

  return (
    <>
      <Button
        icon={RocketLaunch}
        title={t('deployments.title')}
        onClick={() => setOpen(true)}
        style={{ cursor: 'pointer' }}
      />

      {open && (
        <Dialog
          id="deploy-dialog"
          header={t('deployments.dialog.header')}
          onClose={() => setOpen(false)}
          width={1}
        >
          <Card padding={4}>
            <Stack space={4}>
              {loading ? (
                <Flex align="center" justify="center">
                  <Spinner muted />
                </Flex>
              ) : build ? (
                <>
                  <Flex align="center" gap={3}>
                    <Text size={2}>{t('deployments.status.title')}</Text>
                    <Badge
                      padding={2}
                      tone={
                        status === "ready"
                          ? "positive"
                          : status === "building"
                          ? "caution"
                          : status === "error"
                          ? "critical"
                          : "default"
                      }
                    >
                      {t(`deployments.status.options.${status}`)}
                    </Badge>
                    {build.error && (
                      <Text>({build.error})</Text>
                    )}
                  </Flex>
                  <Text size={1} muted>{t('deployments.startedOn')} {build.created_at ? formatDate(locale, build.created_at, { dateStyle: 'medium', timeStyle: 'medium' }) : "–"}</Text>
                    {status !== "building" && (
                      <TextArea
                        onChange={e => setTitle(e.currentTarget.value)}
                        padding={[2]}
                        rows={3}
                        placeholder={t('ui.actions.optionalNote')}
                        value={title}
                      />
                    )}
                  <Flex gap={3} justify="flex-end">
                    {status === "building" ? (
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
                        loading={actionLoading}
                      />
                    )}
                    <Button
                      text={t('deployments.dialog.actions.close')}
                      mode="ghost"
                      onClick={() => setOpen(false)}
                    />
                  </Flex>
                </>
              ) : (
                <Text>{t('deployments.dialog.noInfos')}</Text>
              )}
              <a target="_blank" rel="noopener noreferrer" href={`https://app.netlify.com/projects/${process.env.SANITY_STUDIO_NETLIFY_PROJECT_NAME}/deploys`}>{t('deployments.dialog.actions.goToNetlify')}</a>
            </Stack>
          </Card>
        </Dialog>
      )}
    </>
  )
}