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

"use client"

import { mutate } from 'swr';
import { useClusters } from "../context"
import SearchBar from '@/components/SearchBar';
import { EGObject, createObject, deleteObject } from '@/apis/object';
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
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Slide, Stack, Typography } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { Close } from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { borderValue, primaryColor } from '../style';

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

  const [lastCreatedResource, setLastCreatedResource] = React.useState({} as EGObject)
  const addLastCreatedResource = (resource: EGObject) => {
    setLastCreatedResource(resource)
    setTimeout(() => {
      setLastCreatedResource({} as EGObject)
    }, 3000)
  }

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
        search, setSearch,
        viewYaml, setViewYaml,
        deleteResource: deleteResource.state, setDeleteResource: deleteResource.setState,
        lastCreatedResource,
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
        addLastCreatedResource={addLastCreatedResource}
      />
      {/* view only */}
      <YamlViewer
        open={viewYaml.open}
        onClose={() => { setViewYaml({ open: false, yaml: "" }) }}
        yaml={viewYaml.yaml}
      />
      {/* delete */}
      <DeleteDialog
        open={deleteResource.open}
        onClose={deleteResource.onClose}
        actions={[
          {
            label: intl.formatMessage({ id: "app.general.cancel" }),
            onClick: () => { deleteResource.onClose() },
            props: {
              variant: "outlined",
              style: {
                textTransform: 'none',
                color: "var(--body-regular, #646464)",
                border: borderValue,
              }
            }
          },
          {
            label: intl.formatMessage({ id: "app.general.confirm" }),
            onClick: confirmDeleteResource,
            props: {
              style: {
                textTransform: 'none',
                background: primaryColor
              }
            }
          },
        ]}
      />
    </div>
  )
}

type CreateDialogProps = {
  open: boolean
  onClose: () => void
  cluster: ClusterType
  mutate: () => void
  addLastCreatedResource: (resource: EGObject) => void
}

function CreateDialog({ open, onClose, cluster, mutate, addLastCreatedResource }: CreateDialogProps) {
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
          addLastCreatedResource(egObject)
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

type DeleteDialogProps = {
  open: boolean
  onClose: () => void
  actions?: {
    label: string
    onClick: () => void
    props?: { [key: string]: any }
  }[]
}

function DeleteDialog(props: DeleteDialogProps) {
  const intl = useIntl()
  const { open, onClose, actions } = props

  return (
    <Dialog open={open} keepMounted onClose={onClose} fullWidth maxWidth={"sm"}>
      <DialogTitle sx={{ m: 0, paddingTop: 2, paddingLeft: 2, marginBottom: 0 }}>
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={1}
        >
          <ErrorIcon
            style={{
              width: "24px",
              height: "24px",
              color: "#E37318"
            }}
          />
          <div>{intl.formatMessage({ id: "app.general.notification" })}</div>
        </Stack>
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 20,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>
      <DialogContent >
        <DialogContentText>
          {intl.formatMessage({ id: "app.general.deleteConfirm" })}
        </DialogContentText>
      </DialogContent>

      {actions && actions.length > 0 &&
        <DialogActions style={{ marginRight: "20px", marginBottom: "20px" }}>
          {actions.map((action, index) => {
            return (
              <Button
                key={index}
                variant="contained"
                onClick={action.onClick}
                {...action.props}
              >
                {action.label}
              </Button>
            )
          })}
        </DialogActions>
      }
    </Dialog>
  )
}
