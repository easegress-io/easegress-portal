import { getuid } from "process"
import api from "./api"
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

function getURL(cluster: ClusterType, path: string): string {
  // TODO: later may check protocol, etc.
  return cluster.apiAddresses[0] + path
}

export async function getClusterMembers(cluster: ClusterType) {
  const url = getURL(cluster, urls.Members)
  return await api.get<any, AxiosResponse<MemberType[]>>(url).then(res => res.data)
}
