import { ClusterType, getClusterMembers } from "./cluster";
import useSWR, { SWRConfiguration } from 'swr'
import { getObjects } from "./object";


export function useClusterMembers(cluster: ClusterType, config: SWRConfiguration | undefined = undefined) {
    // call mutate() to refresh data
    const { data, error, isLoading, mutate } = useSWR(
        "cluster members",
        () => { return getClusterMembers(cluster) },
        config
    )

    return {
        members: data,
        error,
        mutate,
        isLoading,
    }
}

export function useObjects(cluster: ClusterType, config: SWRConfiguration | undefined = undefined) {
    // call mutate() to refresh data
    const { data, error, isLoading, mutate } = useSWR(
        "objects",
        () => { return getObjects(cluster) },
        config
    )

    return {
        objects: data,
        error,
        mutate,
        isLoading,
    }
}