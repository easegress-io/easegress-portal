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

import { useObjects } from "@/apis/hooks"
import { useClusters } from "@/app/context"
import React, { Fragment } from "react"
import { EGObject, getObjectStatus, grpcserver, httpserver, pipeline, updateObject } from "@/apis/object"
import { Box, ButtonBase, Chip, CircularProgress, Collapse, IconButton, Stack, TableRow, Typography } from "@mui/material"
import { useIntl } from "react-intl"
import YamlEditorDialog from "@/components/YamlEditorDialog"
import { useSnackbar } from "notistack"
import { catchErrorMessage, loadYaml } from "@/common/utils"
import BlankPage from "@/components/BlankPage"
import ErrorAlert from "@/components/ErrorAlert"
import _ from 'lodash'
import TextButton from "@/components/TextButton"
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import yaml from "js-yaml"
import { useResourcesContext } from "../context"
import { TableData } from "./types"
import { HTTPServerRuleTable, getHTTPTableData } from "./http"
import { GRPCServerRuleTable, getGRPCTableData } from "./grpc"
import { useEditResource } from "../hooks"
import { borderValue, primaryColor } from "@/app/style"
import { ResourceTable, TableBodyCell, TableBodyRow } from "../common"

export default function Traffic() {
  const intl = useIntl()
  const { currentCluster } = useClusters()
  const { search, openViewYaml, openDeleteResource } = useResourcesContext()
  const { objects, error, isLoading, mutate } = useObjects(currentCluster)
  const { enqueueSnackbar } = useSnackbar()

  const searchEGObject = (obejcts: EGObject[] | undefined): EGObject[] => {
    return obejcts?.filter(obj => {
      return obj.name.includes(search) || obj.kind.toLowerCase().includes(search.toLowerCase())
    }) || []
  }
  const httpServers = searchEGObject(objects?.httpServers) as httpserver.HTTPServer[]
  const grpcServers = searchEGObject(objects?.grpcServers) as grpcserver.GRPCServer[]

  const [pipelineMap, setPipelineMap] = React.useState({} as { [key: string]: pipeline.Pipeline })
  const getPipeline = (name: string): pipeline.Pipeline | undefined => {
    return pipelineMap[name]
  }
  React.useEffect(() => {
    const pipelines = objects?.pipelines || []
    const map = {} as { [key: string]: pipeline.Pipeline }
    pipelines.forEach(p => {
      map[p.name] = p
    })
    setPipelineMap(map)
  }, [objects])

  const [expandValues, setExpandValues] = React.useState<{ [key: string]: boolean }>({})
  const getExpandValue = (server: EGObject) => {
    return expandValues[server.name] || false
  }
  const setExpandValue = (server: EGObject, value: boolean) => {
    setExpandValues({ ...expandValues, [server.name]: value })
  }

  const editServer = useEditResource()
  const handleEditServer = () => {
    const resource = editServer.resource
    editServer.onClose()
    const { result, err } = loadYaml(editServer.yaml)
    if (err !== "") {
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.invalidYaml' }, { error: err }), { variant: 'error' })
      return
    }
    if (result.kind !== resource.kind || result.name !== resource.name) {
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.editChangeNameOrKind' }), { variant: 'error' })
      return
    }
    updateObject(currentCluster, resource, editServer.yaml).then(() => {
      mutate()
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.editSuccess' }, { kind: resource.kind, name: resource.name }), { variant: 'success' })
    }).catch(err => {
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.editFailed' }, { kind: resource.kind, name: resource.name, error: catchErrorMessage(err) }), { variant: 'error' })
    })
  }

  // handle edge case
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
  if (httpServers.length === 0 && grpcServers.length === 0) {
    return <BlankPage description={intl.formatMessage({ id: "app.general.noResult" })} />
  }

  const actions = [
    {
      // edit
      label: intl.formatMessage({ id: "app.general.actions.edit" }),
      onClick: (server: EGObject) => {
        editServer.onOpen(server)
      }
    },
    {
      // view yaml
      label: intl.formatMessage({ id: "app.general.actions.yaml" }),
      onClick: (server: EGObject) => {
        openViewYaml(yaml.dump(server))
      }
    },
    {
      // status
      label: intl.formatMessage({ id: "app.general.actions.status" }),
      onClick: (server: EGObject) => {
        getObjectStatus(currentCluster, server.name).then((status) => {
          openViewYaml(yaml.dump(status))
        }).catch(err => {
          enqueueSnackbar(intl.formatMessage(
            { id: 'app.general.getStatusFailed' },
            { kind: server.kind, name: server.name, error: catchErrorMessage(err) }
          ), { variant: 'error' })
        })
      }
    },
    {
      // delete
      label: intl.formatMessage({ id: "app.general.actions.delete" }),
      onClick: (server: EGObject) => {
        // deleteServer.onOpen(server)
        openDeleteResource(server)
      },
      color: "error",
    },
  ]

  const headers = [
    { text: intl.formatMessage({ id: 'app.general.name' }), style: { width: "350px" } },
    { text: intl.formatMessage({ id: 'app.traffic.host' }), style: { flex: 1 } },
    { text: intl.formatMessage({ id: 'app.traffic.port' }), style: { width: "150px" } },
    { text: intl.formatMessage({ id: 'app.general.actions' }), style: { width: "350px" } },
  ]
  return (
    <Fragment>
      <ResourceTable headers={headers}>
        {httpServers.map((server, index) => {
          const open = getExpandValue(server)
          return (
            <TrafficTableRow key={`http-${index}`} server={server} open={open} setOpen={setExpandValue} actions={actions} openViewYaml={openViewYaml} getPipeline={getPipeline} />
          );
        })}
        {grpcServers.map((server, index) => {
          const open = getExpandValue(server)
          return (
            <TrafficTableRow key={`grpc-${index}`} server={server} open={open} setOpen={setExpandValue} actions={actions} openViewYaml={openViewYaml} getPipeline={getPipeline} />
          );
        })}
      </ResourceTable>
      {/* edit */}
      <YamlEditorDialog
        open={editServer.open}
        onClose={editServer.onClose}
        title={intl.formatMessage({ id: "app.general.actions.edit" })}
        yaml={editServer.yaml}
        onYamlChange={(value, ev) => { editServer.onChange(value, ev) }}
        actions={[
          {
            label: intl.formatMessage({ id: "app.general.actions.edit" }),
            onClick: handleEditServer,
          }
        ]}
      />
    </Fragment >
  )
}

function getTableData(server: httpserver.HTTPServer | grpcserver.GRPCServer): TableData {
  if (server.kind === "HTTPServer") {
    return getHTTPTableData(server as httpserver.HTTPServer)
  }
  return getGRPCTableData(server as grpcserver.GRPCServer)
}

type TrafficTableRowProps = {
  server: httpserver.HTTPServer | grpcserver.GRPCServer
  getPipeline: (name: string) => pipeline.Pipeline | undefined
  open: boolean
  setOpen: (server: EGObject, open: boolean) => void
  openViewYaml: (yaml: string) => void
  actions: {
    label: string
    onClick: (server: EGObject) => void
    color?: string
  }[]
}

function TrafficTableRow(props: TrafficTableRowProps) {
  const intl = useIntl()
  const { lastCreatedResource } = useResourcesContext()
  const { server, open, setOpen, actions, openViewYaml, getPipeline } = props
  const data = getTableData(server)
  const showDetails = () => { setOpen(server, !open) }
  const getKindChipLabel = (kind: string) => {
    if (kind === "HTTPServer") {
      return "HTTP"
    }
    return "GRPC"
  }

  return (
    <React.Fragment>
      <TableBodyRow highlight={lastCreatedResource.name === server.name}>
        {/* name */}
        <TableBodyCell>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton size="small" onClick={showDetails}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
            <ButtonBase onClick={showDetails}>
              <Typography fontSize={16} style={{ color: primaryColor }}>{data.name}</Typography>
            </ButtonBase>
            <Chip label={getKindChipLabel(data.kind)} style={{ color: primaryColor }} variant="outlined" size="small" />
          </Stack>
        </TableBodyCell>

        {/* host */}
        <TableBodyCell>
          {data.hosts.map((host, index) => {
            return <div key={`host-${index}`}>{host}</div>
          })}
          {data.hostRegexps.map((host, index) => {
            return <div key={`hostRegexp-${index}`}>{host} <Chip size="small" label={"regexp"} /></div>
          })}
          {data.hosts.length === 0 && data.hostRegexps.length === 0 && <div>*</div>}
        </TableBodyCell>

        {/* port */}
        <TableBodyCell>{data.port}</TableBodyCell>

        {/* actions */}
        <TableBodyCell>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            {actions.map((action, index) => {
              return <TextButton
                key={index}
                onClick={() => { action.onClick(server) }}
                title={action.label}
                color={action.color}
              />
            })}
          </Stack>
        </TableBodyCell>
      </TableBodyRow>
      <TableRow>
        <TableBodyCell style={{ borderTop: open ? borderValue : "none", paddingBottom: 0, paddingTop: 0 }} other={{ colSpan: 100 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              {server.kind === "HTTPServer" ?
                <React.Fragment>
                  <Typography variant="h6" gutterBottom>
                    {intl.formatMessage({ id: "app.traffic.routes" })}
                  </Typography>
                  <HTTPServerRuleTable server={server as httpserver.HTTPServer} onViewYaml={openViewYaml} getPipeline={getPipeline} />
                </React.Fragment> :
                <React.Fragment>
                  <Typography variant="h6" gutterBottom>
                    {intl.formatMessage({ id: "app.traffic.methods" })}
                  </Typography>
                  <GRPCServerRuleTable server={server as grpcserver.GRPCServer} onViewYaml={openViewYaml} getPipeline={getPipeline} />
                </React.Fragment>
              }
            </Box>
          </Collapse>
        </TableBodyCell>
      </TableRow>
    </React.Fragment >
  )
}