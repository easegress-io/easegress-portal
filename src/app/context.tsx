import React from 'react'
import { ClusterContextType, defaultCluster } from '@/apis/cluster'

export const defaultEgctlConfig = `kind: Config

# current used context.
current-context: context-default

# "contexts" section contains "user" and "cluster" information, which informs egctl about which "user" should be used to access a specific "cluster".
contexts:
  - context:
      cluster: cluster-default
      user: user-default
    name: context-default

# "clusters" section contains information about the "cluster".
# "server" specifies the host address that egctl should access.
# "certificate-authority-data" in base64 contain the root certificate authority that the client uses to verify server certificates.
clusters:
  - cluster:
      server: http://localhost:2381
      certificate-authority-data: ""
    name: cluster-default

# "users" section contains "user" information.
# "username" and "password" are used for basic authentication.
# the pair ("client-key-data", "client-certificate-data") in base64 contains the client certificate.
users:
  - name: user-default
    user:
      username: ""
      password: ""
      client-certificate-data: ""
      client-key-data: ""
`

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
