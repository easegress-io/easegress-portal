import React from 'react'
import { ClusterContextType, defaultCluster } from '@/apis/cluster'

export const ClusterContext = React.createContext<ClusterContextType | null>(null)

export const useClusters = () => {
    const { clusters, setClusters,
        currentClusterName, setCurrentClusterName,
    } = React.useContext(ClusterContext)!

    const currentCluster = clusters.find((cluster) => cluster.name === currentClusterName) || defaultCluster

    return {
        clusters, setClusters,
        currentCluster, setCurrentClusterName,
    }
}
