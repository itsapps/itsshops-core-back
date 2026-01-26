// studio/hooks/useNetlifyClient.ts
import React from 'react'
// import { useCoreBackConfig } from '../context/CoreBackConfigContext'
// import { getCoreConfig } from '../config';

export type NetlifyBuild = {
  id?: string;
  deploy_id?: string;
  sha?: string;
  done?: boolean;
  error?: string;
  created_at?: string;
}

export const NetlifyClient = (config: { accessToken: string; siteId: string }) => {
  const url = 'https://api.netlify.com/api/v1'

  const requestData = async (
    method: 'GET' | 'POST',
    path: string,
    payload?: any
  ) => {
    const response = await fetch(url + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.accessToken}`,
      },
      ...payload && { body: JSON.stringify(payload) },
    })
    if (!response.ok) throw new Error(`Netlify request failed: ${response.statusText}`)
    return response.json()
  }

  return {
    // getLatestBuilds: () => get(`/sites/${config.siteId}/builds?page=1&per_page=1`) as Promise<NetlifyBuild[]>,
    // cancelDeploy: (deployId: string) => post(`/deploys/${deployId}/cancel`),
    // triggerDeploy: (title: string) => post(`/sites/${config.siteId}/builds`, {title}),
    getLatestBuilds: () => requestData('GET', `/sites/${config.siteId}/builds?page=1&per_page=1`),
    cancelDeploy: (deployId: string) => requestData('POST', `/deploys/${deployId}/cancel`),
    triggerBuild: (title: string) => requestData('POST', `/sites/${config.siteId}/builds`, {title}),
  }
}

export function useNetlifyClient() {
  // const config = getCoreConfig();
  // const { integrations } = config
  // const netlify = integrations.netlify
  const netlify = {
    accessToken: "sdfsd",
    siteId: "sdfsd"
  }
  return React.useMemo(() => NetlifyClient(netlify), [netlify])
}
