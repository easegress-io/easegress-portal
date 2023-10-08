import React from 'react'
import { ClusterType } from '@/apis/cluster'

export const defaultCluster: ClusterType = {
    id: 0,
    name: "localhost",
    apiAddresses: ["http://localhost:2381"],
}

type ClusterContextType = {
    clusters: ClusterType[]
    setClusters: (clusters: ClusterType[]) => void
    currentClusterID: number
    setCurrentClusterID: (id: number) => void
}

export const ClusterContext = React.createContext<ClusterContextType | null>(null)

export const useClusters = () => {
    const { clusters, setClusters, currentClusterID, setCurrentClusterID } = React.useContext(ClusterContext)!
    const currentCluster = clusters.find((cluster) => cluster.id === currentClusterID) || defaultCluster
    return { clusters, setClusters, currentCluster, setCurrentClusterID }
}
