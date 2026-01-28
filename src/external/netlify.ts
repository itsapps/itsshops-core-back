import { NetlifyClient } from "../types"

export const createNetlifyClient = (accessToken: string, siteId: string): NetlifyClient => {
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
        Authorization: `Bearer ${accessToken}`,
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
    getLatestBuilds: () => requestData('GET', `/sites/${siteId}/builds?page=1&per_page=1`),
    cancelDeploy: (deployId: string) => requestData('POST', `/deploys/${deployId}/cancel`),
    triggerBuild: (title: string) => requestData('POST', `/sites/${siteId}/builds`, {title}),
  }
}