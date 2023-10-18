"use client"

import { mutate } from 'swr';
import { useClusters } from "../context"
import SearchBar from '@/components/SearchBar';
import { createObject, deleteObject } from '@/apis/object';
import { useIntl } from 'react-intl';
import React from 'react';
import { useSnackbar } from 'notistack';
import { catchErrorMessage, loadYaml } from '@/common/utils';
import AddIcon from '@mui/icons-material/Add';
import { ClusterType } from '@/apis/cluster';
import { getObjectsSWRKey } from '@/apis/hooks';
import YamlEditorDialog from '@/components/YamlEditorDialog';
import { ResourceContext } from './context';
import YamlViewer from '@/components/YamlViewer';
import { useDeleteResource } from './hooks';
import SimpleDialog from '@/components/SimpleDialog';
import { Box, Card, CardContent, Paper } from '@mui/material';

export default function Layout({ children, }: { children: React.ReactNode }) {
  const intl = useIntl()
  const { enqueueSnackbar } = useSnackbar()
  const { currentCluster } = useClusters()
  const [search, setSearch] = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [viewYaml, setViewYaml] = React.useState({
    open: false,
    yaml: "",
  })
  const deleteResource = useDeleteResource()
  const confirmDeleteResource = () => {
    const r = deleteResource.resource
    deleteResource.onClose()
    deleteObject(currentCluster, r.name).then(() => {
      mutate(getObjectsSWRKey(currentCluster))
      enqueueSnackbar(intl.formatMessage({ id: "app.general.deleteSuccess" }, { kind: r.kind, name: r.name }), { variant: 'success' })
    }).catch(err => {
      enqueueSnackbar(intl.formatMessage({ id: "app.general.deleteFailed" }, { kind: r.kind, name: r.name, error: catchErrorMessage(err) }), { variant: 'error' })
    })
  }

  const searchBarButtons = [
    {
      icon: <AddIcon />,
      label: intl.formatMessage({ id: 'app.general.actions.create' }),
      onClick: () => { setCreateOpen(true) }
    },
  ]

  return (
    <div>
      <ResourceContext.Provider value={{
        search, setSearch, viewYaml, setViewYaml, deleteResource: deleteResource.state, setDeleteResource: deleteResource.setState,
      }}>
        <Card style={{ boxShadow: "none" }}>
          <Box marginLeft={"24px"} marginRight={"24px"} marginTop={"24px"} marginBottom={"24px"}>
            <SearchBar search={search} onSearchChange={(value: string) => { setSearch(value) }} buttons={searchBarButtons} />
            <Box marginTop={"20px"}>
              {children}
            </Box>
          </Box>
        </Card>
      </ResourceContext.Provider>
      {/* create */}
      <CreateDialog
        open={createOpen}
        onClose={() => { setCreateOpen(false) }}
        cluster={currentCluster}
        mutate={() => { mutate(getObjectsSWRKey(currentCluster)) }}
      />
      {/* view only */}
      <YamlViewer
        open={viewYaml.open}
        onClose={() => { setViewYaml({ open: false, yaml: "" }) }}
        yaml={viewYaml.yaml}
      />
      {/* delete */}
      <SimpleDialog
        open={deleteResource.open}
        onClose={deleteResource.onClose}
        title={intl.formatMessage({ id: "app.general.deleteConfirm" })}
        actions={[{
          label: intl.formatMessage({ id: "app.general.actions.delete" }),
          onClick: confirmDeleteResource,
          style: {
            color: "error",
          }
        }]}
      />
    </div>
  )
}

type CreateDialogProps = {
  open: boolean
  onClose: () => void
  cluster: ClusterType
  mutate: () => void
}

function CreateDialog({ open, onClose, cluster, mutate }: CreateDialogProps) {
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
        const egObject = result as {
          name: string
          kind: string
        }
        createObject(cluster, yamlDoc).then(() => {
          mutate()
          onClose()
          enqueueSnackbar(intl.formatMessage({ id: 'app.general.createSuccess' }, { kind: egObject.kind, name: egObject.name }), { variant: 'success' })
          setYamlDoc('')
        }).catch((err) => {
          enqueueSnackbar(intl.formatMessage({ id: 'app.general.createFailed' }, { kind: egObject.kind, name: egObject.name, error: catchErrorMessage(err) }), { variant: 'error' })
        })
      }
    },
  ]

  return (
    <YamlEditorDialog
      open={open}
      onClose={onClose}
      title={intl.formatMessage({ id: 'app.general.actions.create' })}
      yaml={yamlDoc}
      onYamlChange={onYamlChange}
      actions={actions}
    />
  )
}
