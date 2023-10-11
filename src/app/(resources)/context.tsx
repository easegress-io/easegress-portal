import React from "react"

type ResourceContext = {
    search: string
    setSearch: (search: string) => void
}

export const ResourceContext = React.createContext<ResourceContext>({
    search: "",
    setSearch: () => { },
})

export const useResourcesContext = () => {
    const { search, setSearch } = React.useContext(ResourceContext)
    return { search, setSearch }
}