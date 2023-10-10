import { ClusterType, getClusterMembers } from "./cluster";
import useSWR, { SWRConfiguration } from 'swr'
import { getObjects } from "./object";
import React from "react";


export function useClusterMembers(cluster: ClusterType, config: SWRConfiguration | undefined = undefined) {
  // call mutate() to refresh data
  // the key is import here. useSWR will use the key to cache data.
  // the name parameter here is not used, but to trick useSWR to refresh data when cluster changes.
  const { data, error, isLoading, mutate } = useSWR(
    cluster.name,
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

export function useObjects(cluster: ClusterType, config: SWRConfiguration | undefined = undefined) {
  // call mutate() to refresh data
  // the key is import here. useSWR will use the key to cache data.
  // the name parameter here is not used, but to trick useSWR to refresh data when cluster changes.
  const { data, error, isLoading, mutate } = useSWR(
    cluster.name,
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