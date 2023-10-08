"use client"

import { useObjects } from "@/apis/hooks"
import { useClusters } from "../context"
import { Editor } from "@monaco-editor/react"
import React from "react"
import { Object, createObject } from "@/apis/object"
import { Autocomplete, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, List, TextField } from "@mui/material"
import importSVG from '@/asserts/import.svg'
import Image from "next/image"
import { useIntl } from "react-intl"
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import Spacer from "@/components/Spacer"
import SearchBar from "@/components/SearchBar"
import CloseIcon from '@mui/icons-material/Close';
import YamlEditor from "@/components/YamlEditor"
import { useSnackbar } from "notistack"
import yaml from 'js-yaml'
import { catchHTTPErrorMessage, isNullOrUndefined, loadYaml } from "@/common/utils"

export default function Traffic() {
  const intl = useIntl()
  const { enqueueSnackbar } = useSnackbar()
  const { currentCluster } = useClusters()
  const [search, setSearch] = React.useState("")

  const [createServerYaml, setCreateServerYaml] = React.useState('')
  const [createServerOpen, setCreateServerOpen] = React.useState(false)

  const { objects, error, isLoading, mutate } = useObjects(currentCluster)
  const httpservers = objects?.httpservers.filter((value) => {
    return value.name.includes(search)
  }) || []
  const pipelines = objects?.pipelines || []

  const searchBarButtons = [
    {
      icon: <AddIcon />,
      label: intl.formatMessage({ id: 'app.traffic.createServer' }),
      onClick: () => { setCreateServerOpen(true) }
    },
  ]

  const onCreateServerClose = () => {
    setCreateServerOpen(false)
  }

  const onCreateServerYamlChange = (value: string | undefined, ev: any) => {
    setCreateServerYaml(value || '')
  }

  const createServerActions = [
    {
      label: intl.formatMessage({ id: 'app.general.create' }),
      onClick: () => {
        const { result, err } = loadYaml(createServerYaml)
        if (err !== "") {
          enqueueSnackbar(intl.formatMessage({ id: 'app.general.invalidYaml' }, { error: err }), { variant: 'error' })
          return
        }
        const object = result as Object
        if (object.kind !== 'HTTPServer') {
          enqueueSnackbar(intl.formatMessage({ id: 'app.general.invalidKind' }, { kinds: 'HTTPServer' }), { variant: 'error' })
          return
        }

        createObject(currentCluster, createServerYaml).then(() => {
          mutate()
          onCreateServerClose()
          enqueueSnackbar(intl.formatMessage({ id: 'app.general.createSuccess' }, { kind: 'HTTPServer', name: object.name }), { variant: 'success' })
        }).catch((err) => {
          enqueueSnackbar(intl.formatMessage({ id: 'app.general.createFailed' }, { kind: 'HTTPServer', name: object.name, error: catchHTTPErrorMessage(err) }), { variant: 'error' })
        })
      }
    },
  ]

  return (
    <div>
      <SearchBar search={search} onSearchChange={(value: string) => { setSearch(value) }} buttons={searchBarButtons} />
      <List>
        {httpservers.map((srv, index) => {
          return (
            <div key={index}>{srv.kind} {srv.name}</div>
          )
        })}
        {pipelines.map((pl, index) => {
          return (
            <div key={index}>{pl.kind} {pl.name}</div>
          )
        })}
      </List>
      <YamlEditor
        open={createServerOpen}
        onClose={onCreateServerClose}
        title={intl.formatMessage({ id: 'app.traffic.createServer' })}
        yaml={createServerYaml}
        onYamlChange={onCreateServerYamlChange}
        actions={createServerActions}
      />
    </div>
  )
}
