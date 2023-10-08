"use client"

import { useObjects } from "@/apis/hooks"
import { useClusters } from "../context"
import React from "react"
import { Object, Objects, createObject } from "@/apis/object"
import { Alert, Box, CircularProgress, List } from "@mui/material"
import { useIntl } from "react-intl"
import AddIcon from '@mui/icons-material/Add';
import SearchBar from "@/components/SearchBar"
import YamlEditorDialog from "@/components/YamlEditorDialog"
import { useSnackbar } from "notistack"
import { catchErrorMessage, loadYaml } from "@/common/utils"
import BlankPage from "@/components/BlankPage"
import { ClusterType } from "@/apis/cluster"
import ErrorAlert from "@/components/ErrorAlert"

export default function Traffic() {
  const intl = useIntl()
  const { currentCluster } = useClusters()
  const [search, setSearch] = React.useState("")
  const [createServerOpen, setCreateServerOpen] = React.useState(false)

  const { objects, error, isLoading, mutate } = useObjects(currentCluster)

  const searchBarButtons = [
    {
      icon: <AddIcon />,
      label: intl.formatMessage({ id: 'app.traffic.createServer' }),
      onClick: () => { setCreateServerOpen(true) }
    },
  ]

  return (
    <div>
      <SearchBar search={search} onSearchChange={(value: string) => { setSearch(value) }} buttons={searchBarButtons} />
      <CreateServerDialog open={createServerOpen} onClose={() => { setCreateServerOpen(false) }} cluster={currentCluster} mutate={mutate} />
      <TrafficContent cluster={currentCluster} objects={objects} error={error} isLoading={isLoading} mutate={mutate} search={search} />
    </div>
  )
}

type TrafficContentProps = {
  cluster: ClusterType
  objects: Objects | undefined
  search: string
  error: any
  isLoading: boolean
  mutate: () => void
}

function TrafficContent(props: TrafficContentProps) {
  const intl = useIntl()
  const { cluster, objects, error, isLoading, mutate, search } = props
  const httpServers = objects?.httpServers.filter(server => { return server.name.includes(search) }) || []
  const pipelines = objects?.pipelines || []

  if (isLoading) {
    return (
      <Box padding={'16px'}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <ErrorAlert error={error} expand={true} onClose={() => { }} />
  }

  if (httpServers.length === 0) {
    return <BlankPage description={intl.formatMessage({ id: "app.general.noResult" })} />
  }
  return <>todo</>
}

type CreateServerDialogProps = {
  open: boolean
  onClose: () => void
  cluster: ClusterType
  mutate: () => void
}

function CreateServerDialog({ open, onClose, cluster, mutate }: CreateServerDialogProps) {
  const intl = useIntl()
  const [yamlDoc, setYamlDoc] = React.useState('')
  const { enqueueSnackbar } = useSnackbar()

  const onYamlChange = (value: string | undefined, ev: any) => {
    setYamlDoc(value || '')
  }

  const actions = [
    {
      label: intl.formatMessage({ id: 'app.general.create' }),
      onClick: () => {
        const { result, err } = loadYaml(yamlDoc)
        if (err !== "") {
          enqueueSnackbar(intl.formatMessage({ id: 'app.general.invalidYaml' }, { error: err }), { variant: 'error' })
          return
        }
        const object = result as Object
        if (object.kind !== 'HTTPServer') {
          enqueueSnackbar(intl.formatMessage({ id: 'app.general.invalidKind' }, { kinds: 'HTTPServer' }), { variant: 'error' })
          return
        }

        createObject(cluster, yamlDoc).then(() => {
          mutate()
          onClose()
          enqueueSnackbar(intl.formatMessage({ id: 'app.general.createSuccess' }, { kind: 'HTTPServer', name: object.name }), { variant: 'success' })
        }).catch((err) => {
          enqueueSnackbar(intl.formatMessage({ id: 'app.general.createFailed' }, { kind: 'HTTPServer', name: object.name, error: catchErrorMessage(err) }), { variant: 'error' })
        })
      }
    },
  ]

  return (
    <YamlEditorDialog
      open={open}
      onClose={onClose}
      title={intl.formatMessage({ id: 'app.traffic.createServer' })}
      yaml={yamlDoc}
      onYamlChange={onYamlChange}
      actions={actions}
    />
  )
}