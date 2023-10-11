"use client"

import { useObjects } from "@/apis/hooks"
import { useClusters } from "@/app/context"
import React from "react"
import { EGObject, EGObjects, deleteObject, getObjectStatus, grpcserver, httpserver, pipeline, updateObject } from "@/apis/object"
import { Box, ButtonBase, Chip, CircularProgress, Collapse, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material"
import { useIntl } from "react-intl"
import YamlEditorDialog from "@/components/YamlEditorDialog"
import { useSnackbar } from "notistack"
import { catchErrorMessage, loadYaml } from "@/common/utils"
import BlankPage from "@/components/BlankPage"
import { ClusterType } from "@/apis/cluster"
import ErrorAlert from "@/components/ErrorAlert"
import _ from 'lodash'
import TextButton from "@/components/TextButton"
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import yaml from "js-yaml"
import SimpleDialog from "@/components/SimpleDialog"
import { useResourcesContext } from "../context"
import { TableData } from "./types"
import { HTTPServerRuleTable, getHTTPTableData } from "./http"
import { GRPCServerRuleTable, getGRPCTableData } from "./grpc"

export default function Traffic() {
  const intl = useIntl()
  const { currentCluster } = useClusters()
  const { search } = useResourcesContext()
  const { objects, error, isLoading, mutate } = useObjects(currentCluster)

  return (
    <TrafficContent cluster={currentCluster} objects={objects} error={error} isLoading={isLoading} mutate={mutate} search={search} />
  )
}

function getTableData(server: httpserver.HTTPServer | grpcserver.GRPCServer): TableData {
  if (server.kind === "HTTPServer") {
    return getHTTPTableData(server as httpserver.HTTPServer)
  }
  return getGRPCTableData(server as grpcserver.GRPCServer)
}

type TrafficContentProps = {
  cluster: ClusterType
  objects: EGObjects | undefined
  search: string
  error: any
  isLoading: boolean
  mutate: () => void
}

function TrafficContent(props: TrafficContentProps) {
  const intl = useIntl()
  const { enqueueSnackbar } = useSnackbar()
  const { cluster, objects, error, isLoading, mutate, search } = props

  const searchEGObject = (obejcts: EGObject[] | undefined): EGObject[] => {
    return obejcts?.filter(obj => {
      return obj.name.includes(search) || obj.kind.toLowerCase().includes(search.toLowerCase())
    }) || []
  }
  const httpServers = searchEGObject(objects?.httpServers) as httpserver.HTTPServer[]
  const grpcServers = searchEGObject(objects?.grpcServers) as grpcserver.GRPCServer[]

  const pipelines = objects?.pipelines || []
  const [pipelineMap, setPipelineMap] = React.useState({} as { [key: string]: pipeline.Pipeline })
  const getPipeline = (name: string): pipeline.Pipeline | undefined => {
    return pipelineMap[name]
  }
  React.useEffect(() => {
    const map = {} as { [key: string]: pipeline.Pipeline }
    pipelines.forEach(p => {
      map[p.name] = p
    })
    setPipelineMap(map)
  }, [pipelines])

  const [expandValues, setExpandValues] = React.useState<{ [key: string]: boolean }>({})
  const getExpandValue = (server: EGObject) => {
    return expandValues[server.name] || false
  }
  const setExpandValue = (server: EGObject, value: boolean) => {
    setExpandValues({ ...expandValues, [server.name]: value })
  }

  const viewYaml = useViewYaml()

  const deleteServer = useDeleteServer()
  const confirmDeleteServer = () => {
    const s = deleteServer.server
    deleteServer.onClose()
    deleteObject(cluster, s.name).then(() => {
      mutate()
      enqueueSnackbar(intl.formatMessage({ id: "app.general.deleteSuccess" }, { kind: s.kind, name: s.name }), { variant: 'success' })
    }).catch(err => {
      enqueueSnackbar(intl.formatMessage({ id: "app.general.deleteFailed" }, { kind: s.kind, name: s.name, error: catchErrorMessage(err) }), { variant: 'error' })
    })
  }

  const editServer = useEditServer()
  const handleEditServer = () => {
    const s = editServer.server
    editServer.onClose()
    const { result, err } = loadYaml(editServer.yaml)
    if (err !== "") {
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.invalidYaml' }, { error: err }), { variant: 'error' })
      return
    }
    if (result.kind !== s.kind || result.name !== s.name) {
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.editChangeNameOrKind' }), { variant: 'error' })
      return
    }
    updateObject(cluster, s, editServer.yaml).then(() => {
      mutate()
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.editSuccess' }, { kind: s.kind, name: s.name }), { variant: 'success' })
    }).catch(err => {
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.editFailed' }, { kind: s.kind, name: s.name, error: catchErrorMessage(err) }), { variant: 'error' })
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
        viewYaml.onOpen(yaml.dump(server))
      }
    },
    {
      // status
      label: intl.formatMessage({ id: "app.general.actions.status" }),
      onClick: (server: EGObject) => {
        getObjectStatus(cluster, server.name).then((status) => {
          viewYaml.onOpen(yaml.dump(status))
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
        deleteServer.onOpen(server)
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
              <TableCell style={{ flex: 1 }}>{intl.formatMessage({ id: 'app.traffic.host' })} </TableCell>
              <TableCell style={{ width: "150px" }}>{intl.formatMessage({ id: 'app.traffic.port' })} </TableCell>
              <TableCell style={{ width: "350px" }}>{intl.formatMessage({ id: 'app.general.actions' })} </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {httpServers.map((server, index) => {
              const open = getExpandValue(server)
              return (
                <TrafficTableRow key={`http-${index}`} server={server} open={open} setOpen={setExpandValue} actions={actions} openViewYaml={viewYaml.onOpen} getPipeline={getPipeline} />
              );
            })}
            {grpcServers.map((server, index) => {
              const open = getExpandValue(server)
              return (
                <TrafficTableRow key={`grpc-${index}`} server={server} open={open} setOpen={setExpandValue} actions={actions} openViewYaml={viewYaml.onOpen} getPipeline={getPipeline} />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {/* view only */}
      <YamlEditorDialog
        open={viewYaml.open}
        onClose={viewYaml.onClose}
        title={intl.formatMessage({ id: "app.general.actions.view" })}
        yaml={viewYaml.yaml}
        onYamlChange={() => { }}
        editorOptions={{ readOnly: true }}
      />
      {/* delete */}
      <SimpleDialog
        open={deleteServer.open}
        onClose={deleteServer.onClose}
        title={intl.formatMessage({ id: "app.general.deleteConfirm" })}
        actions={[{
          label: intl.formatMessage({ id: "app.general.actions.delete" }),
          onClick: confirmDeleteServer,
          style: {
            color: "error",
          }
        }]}
      />
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
    </Paper >
  )
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
      <TableRow hover role="checkbox">
        {/* name */}
        <TableCell>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton size="small" onClick={showDetails}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
            <ButtonBase onClick={showDetails}>
              <Typography fontSize={16} color={"primary"}>{data.name}</Typography>
            </ButtonBase>
            <Chip label={getKindChipLabel(data.kind)} color="primary" variant="outlined" size="small" />
          </Stack>
        </TableCell>

        {/* host */}
        <TableCell>
          {data.hosts.map((host, index) => {
            return <div key={`host-${index}`}>{host}</div>
          })}
          {data.hostRegexps.map((host, index) => {
            return <div key={`hostRegexp-${index}`}>{host} <Chip size="small" label={"regexp"} /></div>
          })}
          {data.hosts.length === 0 && data.hostRegexps.length === 0 && <div>*</div>}
        </TableCell>

        {/* port */}
        <TableCell>{data.port}</TableCell>

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
                onClick={() => { action.onClick(server) }}
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
            <Box sx={{ margin: 1 }}>
              {/* <HTTPServerRuleTable server={server} onViewYaml={openViewYaml} getPipeline={getPipeline} /> */}
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
        </TableCell>
      </TableRow>
    </React.Fragment >
  )
}

function useViewYaml() {
  const [state, setState] = React.useState({
    open: false,
    yaml: "",
  })
  const onClose = () => {
    setState({ open: false, yaml: "" })
  }
  const onOpen = (yaml: string) => {
    setState({ open: true, yaml: yaml })
  }
  return {
    open: state.open,
    yaml: state.yaml,
    onClose,
    onOpen,
  }
}

function useDeleteServer() {
  const [state, setState] = React.useState({
    open: false,
    server: {} as EGObject,
  })
  const onOpen = (server: EGObject) => {
    setState({ open: true, server: server })
  }
  const onClose = () => {
    setState({ open: false, server: {} as EGObject })
  }
  return {
    open: state.open,
    server: state.server,
    onOpen,
    onClose,
  }
}

function useEditServer() {
  const [state, setState] = React.useState({
    open: false,
    server: {} as EGObject,
    yaml: "",
  })
  const onOpen = (server: EGObject) => {
    setState({ open: true, server: server, yaml: yaml.dump(server) })
  }
  const onClose = () => {
    setState({ open: false, server: {} as EGObject, yaml: "" })
  }
  const onChange = (value: string | undefined, ev: any) => {
    setState({ ...state, yaml: value || "" })
  }
  return {
    open: state.open,
    server: state.server,
    yaml: state.yaml,
    onOpen,
    onClose,
    onChange,
  }
}