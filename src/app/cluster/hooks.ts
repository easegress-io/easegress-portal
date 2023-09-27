import { ClusterType, getClusterMembers } from "@/apis/cluster";
import useSWR from 'swr'


export function useClusterMembers(cluster: ClusterType) {
    const { data, error, isLoading } = useSWR("cluster members", () => { return getClusterMembers(cluster) })
    return {
        members: data,
        error,
        isLoading
    }
}