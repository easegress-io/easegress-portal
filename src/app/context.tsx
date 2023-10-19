/*
 * Copyright (c) 2023, MegaEase
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
