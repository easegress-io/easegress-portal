/*
 * Copyright (c) 2023, MegaEase
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import api from "./api"
import { urls } from "./urls"
import { AxiosResponse, AxiosRequestConfig } from "axios"

export const defaultCluster: ClusterType = {
  name: "localhost",
  cluster: {
    server: "http://localhost:2381",
  },
}

export type ClusterContextType = {
  clusters: ClusterType[]
  setClusters: (clusters: ClusterType[]) => void
  currentClusterName: string
  setCurrentClusterName: (id: string) => void
}

export type ClusterType = {
  name: string
  cluster: {
    server: string
    'certificate-authority-data'?: string // base64
  }
  axiosConfig?: AxiosRequestConfig
}

export type MemberType = {
  etcd: {
    startTime: string
    state: string
  }
  options: {
    Name: string
    ClusterRole: string
    APIAddr: string
  }
  lastHeartbeatTime: string
}

type ClientInfo = {
  url: string
  config: AxiosRequestConfig
}

export type EgctlConfig = {
  kind: string
  clusters: ClusterType[]
  users: {
    name: string
    user: {
      'client-certificate-data'?: string
      'client-key-data'?: string
      username?: string
      password?: string
    }
  }[]
  contexts: {
    name: string
    context: {
      cluster: string
      user: string
    }
  }[]

  'current-context': string
}

export function getCurrentClusterName(config: EgctlConfig) {
  return config.contexts.find(ctx => ctx.name === config['current-context'])?.context?.cluster || ""
}

export function validateEgctlConfig(config: EgctlConfig): string {
  if (config.clusters?.length === 0) {
    return "No cluster found in config"
  }

  if (config.users?.length === 0) {
    return "No user found in config"
  }

  if (config.contexts?.length === 0) {
    return "No context found in config"
  }

  if (!config['current-context']) {
    return "No current-context found in config"
  }

  let currentContext = config.contexts.find(ctx => ctx.name === config['current-context'])

  if (currentContext === undefined) {
    return `current-context ${config['current-context']} not found in contexts`
  }

  let currentCluster = config.clusters.find(cluster => cluster.name === currentContext?.context?.cluster)
  if (currentCluster === undefined) {
    return `cluster ${currentContext?.context?.cluster} not found in clusters`
  }

  let currentUser = config.users.find(user => user.name === currentContext?.context?.user)
  if (currentUser === undefined) {
    return `user ${currentContext?.context?.user} not found in users`
  }

  let enableMTLS = false
  if (currentCluster.cluster?.["certificate-authority-data"] !== "") {
    enableMTLS = true
  }

  if (enableMTLS) {
    if (currentUser.user?.['client-certificate-data'] === undefined ||
      currentUser.user?.['client-key-data'] === undefined) {
      return `user ${currentUser.name} client-certificate-data or client-key-data not found in users`
    }
  }
  return ""
}

export function parseEgctlConfig(config: EgctlConfig): EgctlConfig {
  config.clusters.forEach((cluster) => {
    const axiosConfig: AxiosRequestConfig = {
      headers: { 'Accept': 'application/json' },
      responseType: 'json'
    }

    let enableMTLS = false
    if (cluster?.cluster["certificate-authority-data"] !== "") {
      enableMTLS = true
    }
    let url = cluster?.cluster.server
    if (enableMTLS) {
      url = url.replace("http://", "https://")
    }
    axiosConfig.url = url

    let context = config.contexts.find(ctx => ctx.context.cluster === cluster.name)
    let user = config.users.find(user => user.name === context?.context?.user)

    if (enableMTLS) {
      axiosConfig.httpsAgent = new (require('https').Agent)({
        rejectUnauthorized: true,
        cert: user?.user?.['client-certificate-data'],
        key: user?.user?.['client-key-data'],
        ca: cluster?.cluster['certificate-authority-data'],
      })
    }

    let username = user?.user?.username || ""
    if (username !== "") {
      axiosConfig.auth = {
        username: user?.user?.username || '',
        password: user?.user?.password || '',
      }
    }
    cluster.axiosConfig = axiosConfig
  })
  return config
}

export function getClientInfo(cluster: ClusterType, path: string): ClientInfo {
  let url = cluster.cluster.server
  if (cluster.axiosConfig?.url) {
    url = cluster.axiosConfig?.url
  }
  return {
    url: url + path,
    config: cluster.axiosConfig || {},
  }
}

export async function getClusterMembers(cluster: ClusterType) {
  const info = getClientInfo(cluster, urls.Members)
  return await api.get<any, AxiosResponse<MemberType[]>>(info.url, info.config).then(res => res.data)
}

export async function getLogs(cluster: ClusterType, tail: number) {
  const info = getClientInfo(cluster, urls.Logs(tail, false))
  return await api.get<any, AxiosResponse<string>>(info.url, info.config).then(res => res.data)
}
