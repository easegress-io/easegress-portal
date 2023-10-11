import React from "react"

type ResourceContext = {
    search: string
    setSearch: (search: string) => void
    viewYaml: {
        open: boolean
        yaml: string
    }
    setViewYaml: ({ open, yaml }: { open: boolean, yaml: string }) => void
}

export const ResourceContext = React.createContext<ResourceContext>({
    search: "",
    setSearch: () => { },
    viewYaml: {
        open: false,
        yaml: "",
    },
    setViewYaml: () => { },
})

export const useResourcesContext = () => {
    const { search, setSearch, setViewYaml } = React.useContext(ResourceContext)
    const openViewYaml = (yaml: string) => {
        setViewYaml({ open: true, yaml })
    }
    return {
        search,
        setSearch,
        openViewYaml,
    }
}