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

import { EGObject } from "@/apis/object"
import React from "react"

type ResourceContext = {
    search: string
    setSearch: (search: string) => void
    viewYaml: {
        open: boolean
        yaml: string
    }
    setViewYaml: ({ open, yaml }: { open: boolean, yaml: string }) => void
    deleteResource: {
        open: boolean
        resource: EGObject
    }
    setDeleteResource: ({ open, resource }: { open: boolean, resource: EGObject }) => void
    lastCreatedResource: EGObject
}

export const ResourceContext = React.createContext<ResourceContext>({
    search: "",
    setSearch: () => { },
    viewYaml: {
        open: false,
        yaml: "",
    },
    setViewYaml: () => { },
    deleteResource: {
        open: false,
        resource: {} as EGObject,
    },
    setDeleteResource: () => { },
    lastCreatedResource: {} as EGObject,
})

export const useResourcesContext = () => {
    const { search, setSearch, setViewYaml, setDeleteResource, lastCreatedResource } = React.useContext(ResourceContext)
    const openViewYaml = (yaml: string) => {
        setViewYaml({ open: true, yaml })
    }
    const openDeleteResource = (resource: EGObject) => {
        setDeleteResource({ open: true, resource })
    }
    return {
        search,
        setSearch,
        openViewYaml,
        openDeleteResource,
        lastCreatedResource,
    }
}