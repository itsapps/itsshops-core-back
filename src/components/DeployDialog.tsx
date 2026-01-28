import { useITSContext } from '../context/ITSCoreProvider'
import { NetlifyBuild } from "../types"

import React, { useEffect, useState, useMemo, useCallback } from 'react'
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
import {RocketLaunch} from 'phosphor-react'

import { createNetlifyClient } from '../external/netlify'


const getStatus = (build: NetlifyBuild | null): "building" | "ready" | "error" | "none" => {
  if (!build) return "none"
  if (!build.done) return "building"
  if (build.error) return "error"
  return "ready"
}

export function DeployDialog() {
  const coreContext = useITSContext()
  const { t, config } = coreContext
  const { accessToken, siteId, projectName } = config.integrations.netlify;
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [build, setBuild] = useState<NetlifyBuild | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [title, setTitle] = useState('')
  const client = useMemo(() => {
    return createNetlifyClient(accessToken, siteId);
  }, [accessToken, siteId]);

  const fetchBuild = useCallback(async (isSilent = false) => {
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
  }, [client]); // Only changes if siteId/accessToken changes

  const handleTrigger = async () => {
    setActionLoading(true)
    try {
      await client.triggerBuild(title ? title : t('deployments.dialog.defaultDeploymentTitle'))
      setTitle('')
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
    if (!open) return

    // Initial explicit load
    fetchBuild()

    const interval = setInterval(() => {
      // Pass true for "silent" so the user doesn't see a spinner every 10s
      fetchBuild(true)
    }, 10000)

    return () => clearInterval(interval)
  }, [open, fetchBuild])

  const status = getStatus(build)

  return (
    <>
      <Button
        icon={RocketLaunch}
        title={t('deployments.title')}
        onClick={() => setOpen(true)}
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
              {loading && !build ? ( // Only show main spinner if we have no data yet
                <Flex align="center" justify="center" padding={4}>
                  <Spinner muted />
                </Flex>
              ) : build ? (
                <>
                  <Flex align="center" gap={3}>
                    <Text size={2} weight="bold">{t('deployments.status.title')}</Text>
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
                      {/* Note: status === 'building' logic works well here */}
                      {t(`deployments.status.options.${status}`)}
                    </Badge>
                    {status === "building" && <Spinner muted />}
                  </Flex>
                  
                  {build.error && (
                    <Card tone="critical" padding={3} radius={2} border>
                      <Text size={1}>{build.error}</Text>
                    </Card>
                  )}

                  <Text size={1} muted>
                    {t('deployments.startedOn')} {build.created_at ?
                      coreContext.format.date(
                        build.created_at,
                        { dateStyle: 'medium', timeStyle: 'medium' }
                      ) : "–"
                    }
                  </Text>

                  {status !== "building" && (
                    <TextArea
                      onChange={e => setTitle(e.currentTarget.value)}
                      padding={3}
                      rows={3}
                      placeholder={t('ui.actions.optionalNote')}
                      value={title}
                    />
                  )}

                  <Flex gap={3} justify="flex-end">
                     <Button
                      text={t('deployments.dialog.actions.close')}
                      mode="ghost"
                      onClick={() => setOpen(false)}
                    />
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
                        disabled={loading} // Prevent double clicks while silent fetching
                      />
                    )}
                  </Flex>
                </>
              ) : (
                <Text size={1} muted>{t('deployments.dialog.noInfos')}</Text>
              )}
              
              <Flex justify="center" paddingTop={2}>
                <Text size={1}>
                  <a 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    href={`https://app.netlify.com/projects/${projectName}/deploys`}
                    style={{ color: 'inherit' }}
                  >
                    {t('deployments.dialog.actions.goToNetlify', { projectName })}
                  </a>
                </Text>
              </Flex>
            </Stack>
          </Card>
        </Dialog>
      )}
    </>
  )
}