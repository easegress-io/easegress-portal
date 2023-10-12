import React from 'react'
import { ClusterType } from '@/apis/cluster'

export const defaultCluster: ClusterType = {
    name: "localhost",
    cluster: {
        server: "http://localhost:2381",
    }
}

type ClusterContextType = {
    clusters: ClusterType[]
    setClusters: (clusters: ClusterType[]) => void
    currentClusterName: string
    setCurrentClusterName: (id: string) => void
}

export const ClusterContext = React.createContext<ClusterContextType | null>(null)

export const useClusters = () => {
    const { clusters, setClusters, currentClusterName, setCurrentClusterName } = React.useContext(ClusterContext)!
    const currentCluster = clusters.find((cluster) => cluster.name === currentClusterName) || defaultCluster
    return { clusters, setClusters, currentCluster, setCurrentClusterName }
}
