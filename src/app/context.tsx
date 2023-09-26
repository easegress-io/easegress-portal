import React from 'react'
import { ClusterType } from '@/common/cluster'

type ClusterContextType = {
    clusters: ClusterType[]
    setClusters: (clusters: ClusterType[]) => void
    currentCluster: ClusterType
    setCurrentCluster: (cluster: ClusterType) => void
}

export const ClusterContext = React.createContext<ClusterContextType | null>(null)

export const useClusters = () => {
    const { clusters, setClusters } = React.useContext(ClusterContext)!
    return { clusters, setClusters }
}

export const useCurrentCluster = () => {
    const { currentCluster, setCurrentCluster } = React.useContext(ClusterContext)!
    return { currentCluster, setCurrentCluster }
}