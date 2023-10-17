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
})

export const useResourcesContext = () => {
    const { search, setSearch, setViewYaml, setDeleteResource } = React.useContext(ResourceContext)
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
    }
}