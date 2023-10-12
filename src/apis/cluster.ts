import api from "./api"
import { urls } from "./urls"
import axios, { AxiosResponse, AxiosRequestConfig, AxiosInstance, Axios } from "axios"

export type ClusterType = {
  name: string
  cluster: {
    server: string
    'certificate-authority-data'?: string // base64
  }
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
      'client-certificate-data'?: string // base64
      'client-key-data'?: string         // base64
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

function egctlConfigToAxiosInstance(config: EgctlConfig): AxiosInstance {
  const axiosConfig: AxiosRequestConfig = {
    headers: {
      'Accept': 'application/json',
    },
    responseType: 'json'
  };

  var ctx = config.contexts.find(ctx => ctx.name === config['current-context'])
  var user = config.users.find(user => user.name === ctx?.context.user)
  var cluster = config.clusters.find(cluster => cluster.name === ctx?.context.cluster)

  var enableMTLS = false
  if (cluster?.cluster["certificate-authority-data"] !== "") {
    enableMTLS = true
  }

  var url = cluster?.cluster.server
  if (enableMTLS) {
    url = "https://" + url
  }
  axiosConfig.url = url

  if (enableMTLS) {
    axiosConfig.httpsAgent = new (require('https').Agent)({
      rejectUnauthorized: true,
      cert: user?.user['client-certificate-data'],
      key: user?.user['client-key-data'],
      ca: cluster?.cluster['certificate-authority-data'],
    })
  }

  if (user?.user['username'] !== "") {
    axiosConfig.auth = {
      username: user?.user['username'] || "",
      password: user?.user['password'] || "",
    }
  }

  const instance = axios.create(axiosConfig);

  return instance
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
