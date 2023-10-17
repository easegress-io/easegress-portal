import { EGObject } from "@/apis/object"
import yaml from "js-yaml"
import React from "react"

export function useEditResource() {
  const [state, setState] = React.useState({
    open: false,
    resource: {} as EGObject,
    yaml: "",
  })
  const onOpen = (server: EGObject) => {
    setState({ open: true, resource: server, yaml: yaml.dump(server) })
  }
  const onClose = () => {
    setState({ open: false, resource: {} as EGObject, yaml: "" })
  }
  const onChange = (value: string | undefined, ev: any) => {
    setState({ ...state, yaml: value || "" })
  }
  return {
    open: state.open,
    resource: state.resource,
    yaml: state.yaml,
    onOpen,
    onClose,
    onChange,
  }
}

export function useDeleteResource() {
  const [state, setState] = React.useState({
    open: false,
    resource: {} as EGObject,
  })
  const onOpen = (server: EGObject) => {
    setState({ open: true, resource: server })
  }
  const onClose = () => {
    setState({ open: false, resource: {} as EGObject })
  }
  return {
    state, setState,
    open: state.open,
    resource: state.resource,
    onOpen,
    onClose,
  }
}