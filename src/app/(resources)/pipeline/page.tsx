"use client"

import { useObjects } from "@/apis/hooks"
import { useClusters } from "@/app/context"
import React from "react"
import { EGObject, deleteObject, getObjectStatus, grpcserver, httpserver, pipeline, updateObject } from "@/apis/object"
import { Avatar, Box, ButtonBase, Chip, CircularProgress, Collapse, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
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
import SimpleDialog from "@/components/SimpleDialog"
import { useResourcesContext } from "../context"
import { useDeleteResource, useEditResource } from "../hooks"

export default function Pipeline() {
  const intl = useIntl()
  const { currentCluster } = useClusters()
  const { search, openViewYaml } = useResourcesContext()
  const { objects, error, isLoading, mutate } = useObjects(currentCluster)
  const { enqueueSnackbar } = useSnackbar()

  const searchEGObject = (obejcts: EGObject[] | undefined): EGObject[] => {
    return obejcts?.filter(obj => {
      return obj.name.includes(search) || obj.kind.toLowerCase().includes(search.toLowerCase())
    }) || []
  }
  const pipelines = searchEGObject(objects?.pipelines) as pipeline.Pipeline[]

  const [serverMap, setServerMap] = React.useState({} as { [key: string]: EGObject[] })
  const getServers = (pipeline: pipeline.Pipeline): EGObject[] => {
    return serverMap[pipeline.name] || []
  }
  React.useEffect(() => {
    const map = {} as { [key: string]: EGObject[] }
    objects?.httpServers.forEach(s => {
      s.rules?.forEach(rule => {
        rule.paths?.forEach(path => {
          map[path.backend] ? (map[path.backend].push(s)) : (map[path.backend] = [s])
        })
      })
    })
    objects?.grpcServers.forEach(s => {
      s.rules?.forEach(rule => {
        rule.methods?.forEach(m => {
          map[m.backend] ? (map[m.backend].push(s)) : (map[m.backend] = [s])
        })
      })
    })
    setServerMap(map)
  }, [objects])

  const [expandValues, setExpandValues] = React.useState<{ [key: string]: boolean }>({})
  const getExpandValue = (server: EGObject) => {
    return expandValues[server.name] || false
  }
  const setExpandValue = (server: EGObject, value: boolean) => {
    setExpandValues({ ...expandValues, [server.name]: value })
  }

  const deletePipeline = useDeleteResource()
  const confirmDeletePipeline = () => {
    const resource = deletePipeline.resource
    deletePipeline.onClose()
    deleteObject(currentCluster, resource.name).then(() => {
      mutate()
      enqueueSnackbar(intl.formatMessage({ id: "app.general.deleteSuccess" }, { kind: resource.kind, name: resource.name }), { variant: 'success' })
    }).catch(err => {
      enqueueSnackbar(intl.formatMessage({ id: "app.general.deleteFailed" }, { kind: resource.kind, name: resource.name, error: catchErrorMessage(err) }), { variant: 'error' })
    })
  }

  const editPipeline = useEditResource()
  const handleEditServer = () => {
    const resource = editPipeline.resource
    editPipeline.onClose()
    const { result, err } = loadYaml(editPipeline.yaml)
    if (err !== "") {
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.invalidYaml' }, { error: err }), { variant: 'error' })
      return
    }
    if (result.kind !== resource.kind || result.name !== resource.name) {
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.editChangeNameOrKind' }), { variant: 'error' })
      return
    }
    updateObject(currentCluster, resource, editPipeline.yaml).then(() => {
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
  if (pipelines.length === 0) {
    return <BlankPage description={intl.formatMessage({ id: "app.general.noResult" })} />
  }

  const actions = [
    {
      // edit
      label: intl.formatMessage({ id: "app.general.actions.edit" }),
      onClick: (server: EGObject) => {
        editPipeline.onOpen(server)
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
        deletePipeline.onOpen(server)
      },
      color: "error",
    },
  ]

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell style={{ width: "350px" }}>{intl.formatMessage({ id: 'app.general.name' })} </TableCell>
              <TableCell style={{ width: "200px" }}>{intl.formatMessage({ id: 'app.pipeline.tags' })} </TableCell>
              <TableCell style={{ width: "350px" }}>{intl.formatMessage({ id: 'app.pipeline.resilience' })} </TableCell>
              <TableCell style={{ width: "350px" }}>{intl.formatMessage({ id: 'app.pipeline.usedBy' })} </TableCell>
              <TableCell style={{ width: "350px" }}>{intl.formatMessage({ id: 'app.general.actions' })} </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pipelines.map((pipeline, index) => {
              const open = getExpandValue(pipeline)
              return (
                <TrafficTableRow key={`pipeline-${index}`} pipeline={pipeline} open={open} setOpen={setExpandValue} actions={actions} openViewYaml={openViewYaml} getServers={getServers} />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {/* delete */}
      <SimpleDialog
        open={deletePipeline.open}
        onClose={deletePipeline.onClose}
        title={intl.formatMessage({ id: "app.general.deleteConfirm" })}
        actions={[{
          label: intl.formatMessage({ id: "app.general.actions.delete" }),
          onClick: confirmDeletePipeline,
          style: {
            color: "error",
          }
        }]}
      />
      {/* edit */}
      <YamlEditorDialog
        open={editPipeline.open}
        onClose={editPipeline.onClose}
        title={intl.formatMessage({ id: "app.general.actions.edit" })}
        yaml={editPipeline.yaml}
        onYamlChange={(value, ev) => { editPipeline.onChange(value, ev) }}
        actions={[
          {
            label: intl.formatMessage({ id: "app.general.actions.edit" }),
            onClick: handleEditServer,
          }
        ]}
      />
    </Paper >
  )
}

type TrafficTableRowProps = {
  pipeline: pipeline.Pipeline
  getServers: (pipeline: pipeline.Pipeline) => EGObject[]
  open: boolean
  setOpen: (pipeline: EGObject, open: boolean) => void
  openViewYaml: (yaml: string) => void
  actions: {
    label: string
    onClick: (server: EGObject) => void
    color?: string
  }[]
}

function TrafficTableRow(props: TrafficTableRowProps) {
  const intl = useIntl()
  const { pipeline, open, setOpen, actions, openViewYaml, getServers } = props
  const showDetails = () => { setOpen(pipeline, !open) }
  const servers = getServers(pipeline)

  const getKindChipLabel = (kind: string) => {
    if (kind === "HTTPServer") {
      return "HTTP"
    }
    return "GRPC"
  }

  return (
    <React.Fragment>
      <TableRow hover role="checkbox">
        {/* name */}
        <TableCell>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton size="small" onClick={showDetails}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
            <ButtonBase onClick={showDetails}>
              <Typography fontSize={16} color={"primary"}>{pipeline.name}</Typography>
            </ButtonBase>
          </Stack>
        </TableCell>

        {/* tags */}
        <TableCell>
          <Chip label="Filter" avatar={<Avatar>{pipeline.filters.length}</Avatar>} />
        </TableCell>

        {/* resilience */}
        <TableCell>
          {pipeline.resilience ?
            <Stack
              direction="column"
              justifyContent="center"
              alignItems="flex-start"
              spacing={1}
            >
              {pipeline.resilience.map((r, index) => {
                return <div key={index}>
                  {r.name}
                  <Chip sx={{ marginLeft: 1 }} size="small" label={r.kind} color="primary" variant="outlined" />
                </div>
              })}
            </Stack> :
            <Chip label={"None"} size="small" />
          }
        </TableCell>

        {/* used by */}
        <TableCell>
          {servers.length > 0 ?
            <div>
              <Stack
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
                spacing={1}
              >
                {servers.map((server, index) => {
                  return <Stack
                    key={index}
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={1}
                  >
                    <TextButton title={server.name} onClick={() => { openViewYaml(yaml.dump(server)) }} />
                    <Chip label={getKindChipLabel(server.kind)} color="primary" variant="outlined" size="small" />
                  </Stack>
                })}
              </Stack>
            </div> :
            <div>None</div>
          }
        </TableCell>

        {/* actions */}
        <TableCell>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            {actions.map((action, index) => {
              return <TextButton
                key={index}
                onClick={() => { action.onClick(pipeline) }}
                title={action.label}
                color={action.color}
              />
            })}
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={100}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ marginTop: 2, marginLeft: 4 }}>
              <React.Fragment>
                <Typography variant="h6" gutterBottom>
                  {intl.formatMessage({ id: "app.pipeline.flow" })}
                </Typography>
                <PipelineFilterTable pipeline={pipeline} onViewYaml={openViewYaml} />
              </React.Fragment>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment >
  )
}

export type PipelineFilterTableProps = {
  pipeline: pipeline.Pipeline
  onViewYaml: (yaml: string) => void
}

export function PipelineFilterTable(props: PipelineFilterTableProps) {
  const intl = useIntl()
  const { pipeline, onViewYaml } = props
  const flow = pipeline.flow || []

  const tableHeads = [
    intl.formatMessage({ id: 'app.general.name' }),
    intl.formatMessage({ id: 'app.general.kind' }),
    intl.formatMessage({ id: 'app.pipeline.alias' }),
    intl.formatMessage({ id: 'app.pipeline.jumpIf' }),
  ]

  return (
    <Table size="small" sx={{ width: "1000px" }}>
      <TableHead>
        <TableRow>
          {tableHeads.map((head, index) => {
            return (
              <TableCell key={index}>{head}</TableCell>
            )
          })}
        </TableRow>
      </TableHead>
      <TableBody>
        {flow.length > 0 ?
          <React.Fragment>
            {flow.map((f, index) => {
              const filter = pipeline.filters.find(filter => filter.name === f.filter)
              let jumpIf = ""
              _.map(f.jumpIf, (value, key) => {
                jumpIf += `${key} -> ${value}\n`
              })
              return <TableRow key={index}>
                <TableCell>{f.filter || "not found"}</TableCell>
                <TableCell>{filter?.kind || "builtin"}</TableCell>
                <TableCell>{f.alias || <Chip label={"None"} size="small" />}</TableCell>
                <TableCell><pre>{jumpIf === "" ? <Chip label={"None"} size="small" /> : jumpIf}</pre></TableCell>
              </TableRow>
            })}
          </React.Fragment> :
          <React.Fragment>
            {pipeline.filters.map((f, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>{f.name}</TableCell>
                  <TableCell>{f.kind}</TableCell>
                  <TableCell><Chip label={"None"} size="small" /></TableCell>
                  <TableCell><Chip label={"None"} size="small" /></TableCell>
                </TableRow>
              )
            })}
          </React.Fragment>
        }
      </TableBody>
    </Table >
  )
}