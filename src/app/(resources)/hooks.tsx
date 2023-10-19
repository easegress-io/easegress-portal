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