import { ClusterType, getClusterMembers, getLogs } from "./cluster";
import useSWR, { SWRConfiguration } from 'swr'
import { getObjects } from "./object";
import React from "react";

export const getClusterMembersSWRKey = (cluster: ClusterType) => {
  return `members/${cluster.name}`
}

export function useClusterMembers(cluster: ClusterType, config: SWRConfiguration | undefined = undefined) {
  // call mutate() to refresh data
  // the key is import here. useSWR will use the key to cache data.
  // the name parameter here is not used, but to trick useSWR to refresh data when cluster changes.
  const { data, error, isLoading, mutate } = useSWR(
    getClusterMembersSWRKey(cluster),
    (name: string) => { return getClusterMembers(cluster) },
    config
  )

  React.useEffect(() => {
    mutate()
  }, [cluster])

  return {
    members: data,
    error,
    mutate,
    isLoading,
  }
}

export const getObjectsSWRKey = (cluster: ClusterType) => {
  return `objects/${cluster.name}`
}

export function useObjects(cluster: ClusterType, config: SWRConfiguration | undefined = undefined) {
  // call mutate() to refresh data
  // the key is import here. useSWR will use the key to cache data.
  // the name parameter here is not used, but to trick useSWR to refresh data when cluster changes.
  const { data, error, isLoading, mutate } = useSWR(
    getObjectsSWRKey(cluster),
    (name: string) => { return getObjects(cluster) },
    config
  )

  React.useEffect(() => {
    mutate()
  }, [cluster])

  return {
    objects: data,
    error,
    mutate,
    isLoading,
  }
}

export const getLogsSWRKey = (cluster: ClusterType, tail: number) => {
  return `logs/${cluster.name}/${tail}`
}

export function useLogs(cluster: ClusterType, tail: number, config: SWRConfiguration | undefined = undefined) {
  // call mutate() to refresh data
  // the key is import here. useSWR will use the key to cache data.
  // the name parameter here is not used, but to trick useSWR to refresh data when cluster changes.
  const { data, error, isLoading, mutate } = useSWR(
    getLogsSWRKey(cluster, tail),
    (name: string) => {
      return getLogs(cluster, tail)
    }
  )

  React.useEffect(() => {
    mutate()
  }, [cluster, tail])
  return {
    logs: data,
    error,
    mutate,
    isLoading
  }
}