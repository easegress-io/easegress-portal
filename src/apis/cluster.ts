import api from "./api"
import { AxiosRequestConfig } from "axios"
import { urls } from "./urls"
import { AxiosResponse } from "axios"

export type ClusterType = {
  id: number
  name: string
  apiAddresses: string[]
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

type EgctlConfig = {
  kind: string
  clusters: {
    name: string
    cluster: {
      server: string
      'certificate-authority-data': string // base64
    }
  }[]
  users: {
    name: string
    user: {
      'client-certificate-data': string // base64
      'client-key-data': string         // base64
      username: string
      password: string
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

export function getClientInfo(cluster: ClusterType, path: string): ClientInfo {
  // TODO: later may check protocol, and add auth, mtls to config
  return {
    url: cluster.apiAddresses[0] + path,
    config: {}
  }
}

export async function getClusterMembers(cluster: ClusterType) {
  const info = getClientInfo(cluster, urls.Members)
  return await api.get<any, AxiosResponse<MemberType[]>>(info.url, info.config).then(res => res.data)
}
