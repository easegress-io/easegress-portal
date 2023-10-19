"use client"

import { useObjects } from "@/apis/hooks"
import { useClusters } from "@/app/context"
import React, { Fragment } from "react"
import { EGObject, getObjectStatus, pipeline, updateObject } from "@/apis/object"
import { Avatar, Box, Button, ButtonBase, Chip, CircularProgress, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TableRow, Typography } from "@mui/material"
import { useIntl } from "react-intl"
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
import { useEditResource } from "../hooks"
import FlowChart from "./FlowChart"
import { editor } from 'monaco-editor';
import Close from "@mui/icons-material/Close"
import { Editor } from "@monaco-editor/react"
import { primaryColor } from "@/app/style"
import { ResourceTable, TableBodyCell } from "../common"

export default function Pipeline() {
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
      onClick: (pipeline: EGObject) => {
        // deletePipeline.onOpen(server)
        openDeleteResource(pipeline)
      },
      color: "error",
    },
  ]

  const headers = [
    { text: intl.formatMessage({ id: 'app.general.name' }), style: { width: "350px" } },
    { text: intl.formatMessage({ id: 'app.pipeline.tags' }), style: { width: "200px" } },
    { text: intl.formatMessage({ id: 'app.pipeline.resilience' }), style: { width: "350px" } },
    { text: intl.formatMessage({ id: 'app.pipeline.usedBy' }), style: { width: "350px" } },
    { text: intl.formatMessage({ id: 'app.general.actions' }), style: { width: "350px" } },
  ]
  return (
    <Fragment>
      <ResourceTable headers={headers}>
        {pipelines.map((pipeline, index) => {
          const open = getExpandValue(pipeline)
          return (
            <TrafficTableRow key={`pipeline-${index}`} pipeline={pipeline} open={open} setOpen={setExpandValue} actions={actions} openViewYaml={openViewYaml} getServers={getServers} />
          );
        })}
      </ResourceTable>
      {/* edit */}
      <EditPipelineDialog
        open={editPipeline.open}
        onClose={editPipeline.onClose}
        yaml={editPipeline.yaml}
        onYamlChange={(value, ev) => { editPipeline.onChange(value, ev) }}
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

type EditPipelineDialogProps = {
  open: boolean
  onClose: () => void
  yaml: string
  onYamlChange: (value: string | undefined, ev: editor.IModelContentChangedEvent) => void
  actions?: {
    label: string
    onClick: () => void
    style?: { [key: string]: any }
  }[]
}

function EditPipelineDialog(props: EditPipelineDialogProps) {
  const intl = useIntl()
  const { open, onClose, yaml, onYamlChange, actions } = props
  const options = {
    scrollBeyondLastLine: false,
    fontSize: 14,
  }
  const getPipeline = () => {
    const { result, err } = loadYaml(yaml)
    if (err !== "") {
      return undefined
    }
    return result as pipeline.Pipeline
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {intl.formatMessage({ id: "app.general.actions.view" })}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>

      <DialogContent>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="flex-start"
          spacing={2}
        >
          <Editor language="yaml" value={yaml} height={'80vh'} onChange={onYamlChange} options={options} />
          <FlowChart pipeline={getPipeline()} />
        </Stack>
      </DialogContent>
      {actions && actions.length > 0 &&
        <DialogActions style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }} >
          {actions.map((action, index) => {
            return (
              <Button
                key={index}
                variant="contained"
                style={{
                  textTransform: 'none',
                  marginLeft: '8px',
                  marginRight: '8px',
                  minWidth: '150px',
                  ...action.style
                }}
                onClick={action.onClick}
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
        <TableBodyCell>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton size="small" onClick={showDetails}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
            <ButtonBase onClick={showDetails}>
              <Typography fontSize={16} style={{ color: primaryColor }}>{pipeline.name}</Typography>
            </ButtonBase>
          </Stack>
        </TableBodyCell>

        {/* tags */}
        <TableBodyCell>
          <Chip label="Filter" avatar={<Avatar>{pipeline.filters.length}</Avatar>} />
        </TableBodyCell>

        {/* resilience */}
        <TableBodyCell>
          {pipeline.resilience ?
            <Stack
              direction="column"
              justifyContent="center"
              alignItems="flex-start"
              spacing={1}
            >
              {pipeline.resilience.map((r, index) => {
                return <div key={index}>
                  <TextButton title={r.name} onClick={() => { openViewYaml(yaml.dump(r)) }} />
                  <Chip sx={{ marginLeft: 1 }} size="small" label={r.kind} style={{ color: primaryColor }} variant="outlined" />
                </div>
              })}
            </Stack> :
            <ChipNone />
          }
        </TableBodyCell>

        {/* used by */}
        <TableBodyCell>
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
                    <Chip label={getKindChipLabel(server.kind)} style={{ color: primaryColor }} variant="outlined" size="small" />
                  </Stack>
                })}
              </Stack>
            </div> :
            <div>None</div>
          }
        </TableBodyCell>

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
                onClick={() => { action.onClick(pipeline) }}
                title={action.label}
                color={action.color}
              />
            })}
          </Stack>
        </TableBodyCell>
      </TableRow>
      <TableRow>
        <TableBodyCell style={{ borderTop: "none", paddingBottom: 0, paddingTop: 0 }} other={{ colSpan: 100 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ marginTop: 2, marginLeft: 4 }}>
              <React.Fragment>
                <Typography variant="h6" gutterBottom>
                  {intl.formatMessage({ id: "app.pipeline.flow" })}
                </Typography>
                <Stack
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="flex-start"
                  spacing={2}
                >
                  <PipelineFilterTable pipeline={pipeline} onViewYaml={openViewYaml} />
                  <FlowChart pipeline={pipeline} />
                </Stack>
              </React.Fragment>
            </Box>
          </Collapse>
        </TableBodyCell>
      </TableRow>
    </React.Fragment >
  )
}

type PipelineFilterTableProps = {
  pipeline: pipeline.Pipeline
  onViewYaml: (yaml: string) => void
}

function PipelineFilterTable(props: PipelineFilterTableProps) {
  const intl = useIntl()
  const { pipeline, onViewYaml } = props
  const getFlow = (pipeline: pipeline.Pipeline) => {
    if (pipeline.flow && pipeline.flow.length > 0) {
      return pipeline.flow
    }
    return pipeline.filters.map(f => {
      return {
        filter: f.name,
        alias: "",
        jumpIf: {},
        namespace: "",
      }
    })
  }
  const flow = getFlow(pipeline)

  const headers = [
    { text: intl.formatMessage({ id: 'app.general.name' }) },
    { text: intl.formatMessage({ id: 'app.general.kind' }) },
    { text: intl.formatMessage({ id: 'app.pipeline.alias' }) },
    { text: intl.formatMessage({ id: 'app.pipeline.jumpIf' }) },
    { text: intl.formatMessage({ id: 'app.general.actions' }) },
  ]
  return (
    <ResourceTable headers={headers}>
      {flow.map((f, index) => {
        const filter = pipeline.filters.find(filter => filter.name === f.filter)
        let jumpIf = ""
        _.map(f.jumpIf, (value, key) => {
          jumpIf += `${key} -> ${value}\n`
        })
        return <TableRow key={index}>
          <TableBodyCell>{f.filter || "not found"}</TableBodyCell>
          <TableBodyCell>{filter?.kind || "builtin"}</TableBodyCell>
          <TableBodyCell>{f.alias || <ChipNone />}</TableBodyCell>
          <TableBodyCell><pre>{jumpIf === "" ? <ChipNone /> : jumpIf}</pre></TableBodyCell>
          <TableBodyCell>
            <TextButton title={intl.formatMessage({ id: "app.general.actions.view" })} onClick={() => { onViewYaml(yaml.dump(filter) || "") }} />
          </TableBodyCell>
        </TableRow>
      })}
    </ResourceTable>
  )
}

function ChipNone() {
  return <Chip label={"None"} size="small" />
}