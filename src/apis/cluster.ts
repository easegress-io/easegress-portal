import React from 'react'
import api from "./api"
import { urls } from "./urls"
import axios, { AxiosResponse, AxiosRequestConfig, AxiosInstance, Axios } from "axios"

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

  axiosInstance?: AxiosInstance
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

export function ValidateEgctlConfig(config: EgctlConfig): string {
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
    return "current-context ${config['current-context']} not found in contexts"
  }

  let currentCluster = config.clusters.find(cluster => cluster.name === currentContext?.context?.cluster)
  if (currentCluster === undefined) {
    return "cluster ${current-context?.context?.cluster} not found in clusters"
  }

  let currentUser = config.users.find(user => user.name === currentContext?.context?.user)
  if (currentUser === undefined) {
    return "user ${current-context?.context?.user} not found in users"
  }

  let enableMTLS = false
  if (currentCluster.cluster?.["certificate-authority-data"] !== "") {
    enableMTLS = true
  }

  if (enableMTLS) {
    if (currentUser.user?.['client-certificate-data'] === undefined ||
      currentUser.user?.['client-key-data'] === undefined) {
      return "user ${currentUser.name} client-certificate-data or client-key-data not found in user"
    }
  }

  return ""
}


export function parseEgctlConfig(config: EgctlConfig): EgctlConfig {
  const axiosConfig: AxiosRequestConfig = {
    headers: {
      'Accept': 'application/json',
    },
    responseType: 'json'
  };

  console.log("config: ", config)
  console.log("clusters: ", config.clusters)
  config.clusters.forEach((cluster) => {
    let enableMTLS = false
    if (cluster?.cluster["certificate-authority-data"] !== "") {
      enableMTLS = true
    }

    var url = cluster?.cluster.server
    if (enableMTLS) {
      url = "https://" + url
    }
    axiosConfig.url = url

    let user = config.users.find(user => user.name === config.contexts.find(ctx => ctx.name === config['current-context'])?.context?.user)

    if (enableMTLS) {
      axiosConfig.httpsAgent = new (require('https').Agent)({
        rejectUnauthorized: true,
        cert: user?.user?.['client-certificate-data'],
        key: user?.user?.['client-key-data'],
        ca: cluster?.cluster['certificate-authority-data'],
      })
    }

    if (user?.user?.username !== "") {
      axiosConfig.auth = {
        username: user?.user?.username || '',
        password: user?.user?.password || '',
      }
    }

    cluster.axiosInstance = axios.create(axiosConfig)
  })

  return config
}

export function getClientInfo(cluster: ClusterType, path: string): ClientInfo {
  // TODO: later may check protocol, and add auth, mtls to config
  return {
    url: cluster.cluster.server + path,
    config: {}
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
