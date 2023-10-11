"use client"

import { useObjects } from "@/apis/hooks"
import { useClusters } from "@/app/context"
import React from "react"
import { Object, Objects, createObject, deleteObject, getObjectStatus, httpserver, pipeline, updateObject } from "@/apis/object"
import { Box, Chip, CircularProgress, Collapse, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material"
import { useIntl } from "react-intl"
import AddIcon from '@mui/icons-material/Add';
import SearchBar from "@/components/SearchBar"
import YamlEditorDialog from "@/components/YamlEditorDialog"
import { useSnackbar } from "notistack"
import { catchErrorMessage, loadYaml } from "@/common/utils"
import BlankPage from "@/components/BlankPage"
import { ClusterType } from "@/apis/cluster"
import ErrorAlert from "@/components/ErrorAlert"
import _ from 'lodash'
import TextButton from "@/components/TextButton"
import Image from "next/image"
import easegressSVG from '@/asserts/easegress.svg'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import yaml from "js-yaml"
import SimpleDialog from "@/components/SimpleDialog"

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

type TableData = {
  name: string
  hosts: string[]
  hostRegexps: string[]
  port: number
}

function getTableData(httpServer: httpserver.HTTPServer): TableData {
  const hosts: string[] = []
  const hostRegexps: string[] = []
  httpServer.rules?.forEach(rule => {
    rule.host && hosts.push(rule.host)
    rule.hostRegexp && hostRegexps.push(rule.hostRegexp)
    rule.hosts && rule.hosts.forEach(host => {
      if (host.isRegexp) {
        hostRegexps.push(host.value)
      } else {
        hosts.push(host.value)
      }
    })
  })

  return {
    name: httpServer.name,
    hosts: _.uniq(hosts.filter(host => { return host !== "" })),
    hostRegexps: _.uniq(hostRegexps.filter(host => { return host !== "" })),
    port: httpServer.port,
  }
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
  const { enqueueSnackbar } = useSnackbar()
  const { cluster, objects, error, isLoading, mutate, search } = props
  const httpServers = objects?.httpServers?.filter(server => { return server.name.includes(search) }) || []
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
  const getExpandValue = (server: httpserver.HTTPServer) => {
    return expandValues[server.name] || false
  }
  const setExpandValue = (server: httpserver.HTTPServer, value: boolean) => {
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
  if (httpServers.length === 0) {
    return <BlankPage description={intl.formatMessage({ id: "app.general.noResult" })} />
  }

  const actions = [
    {
      // edit
      label: intl.formatMessage({ id: "app.general.actions.edit" }),
      onClick: (server: httpserver.HTTPServer) => {
        editServer.onOpen(server)
      }
    },
    {
      // view yaml
      label: intl.formatMessage({ id: "app.general.actions.yaml" }),
      onClick: (server: httpserver.HTTPServer) => {
        viewYaml.onOpen(yaml.dump(server))
      }
    },
    {
      // status
      label: intl.formatMessage({ id: "app.general.actions.status" }),
      onClick: (server: httpserver.HTTPServer) => {
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
      onClick: (server: httpserver.HTTPServer) => {
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
                <TrafficTableRow key={index} server={server} open={open} setOpen={setExpandValue} actions={actions} openViewYaml={viewYaml.onOpen} getPipeline={getPipeline} />
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
  server: httpserver.HTTPServer
  getPipeline: (name: string) => pipeline.Pipeline | undefined
  open: boolean
  setOpen: (server: httpserver.HTTPServer, open: boolean) => void
  openViewYaml: (yaml: string) => void
  actions: {
    label: string
    onClick: (server: httpserver.HTTPServer) => void
    color?: string
  }[]
}

function TrafficTableRow(props: TrafficTableRowProps) {
  const { server, open, setOpen, actions, openViewYaml, getPipeline } = props
  const data = getTableData(server)
  const showDetails = () => { setOpen(server, !open) }

  return (
    <React.Fragment>
      <TableRow hover role="checkbox">
        {/* name */}
        <TableCell>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton size="small" onClick={showDetails}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
            <Image
              onClick={showDetails}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '1px solid #dedede',
              }
              }
              src={easegressSVG}
              alt="Easegres" />
            <TextButton title={data.name} onClick={showDetails} />
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
              <Typography variant="h6" gutterBottom>
                Routes
              </Typography>
              <HTTPServerRuleTable server={server} onViewYaml={openViewYaml} getPipeline={getPipeline} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment >
  )
}

type HTTPServerRuleData = {
  rule: httpserver.Rule
  hosts: string[]
  hostRegexps: string[]
  sameHost: boolean
  path: string
  pathPrefix: string
  pathRegexp: string
  ipFilter: httpserver.IPFilter | undefined
  headers: httpserver.Header[] | undefined
  methods: string[] | undefined
  pipeline: string
}

function getAllHTTPServerRuleData(server: httpserver.HTTPServer) {
  const allData: HTTPServerRuleData[] = []

  server.rules?.forEach(rule => {
    const hosts: string[] = []
    const hostRegexps: string[] = []
    rule.host && hosts.push(rule.host)
    rule.hostRegexp && hostRegexps.push(rule.hostRegexp)
    rule.hosts && rule.hosts.forEach(host => {
      if (host.isRegexp) {
        hostRegexps.push(host.value)
      } else {
        hosts.push(host.value)
      }
    })

    rule.paths?.forEach(path => {
      const data: HTTPServerRuleData = {
        rule: rule,
        hosts: hosts,
        hostRegexps: hostRegexps,
        sameHost: false,
        path: path.path || "",
        pathPrefix: path.pathPrefix || "",
        pathRegexp: path.pathRegexp || "",
        ipFilter: httpserver.isIPFilterEmpty(path.ipFilter) ? (httpserver.isIPFilterEmpty(rule.ipFilter) ? undefined : rule.ipFilter) : path.ipFilter,
        headers: httpserver.isHeadersEmpty(path.headers) ? undefined : path.headers,
        methods: (path.methods && path.methods.length > 0) ? path.methods : undefined,
        pipeline: path.backend,
      }
      allData.push(data)
    })
  })

  allData.forEach((data, index) => {
    if (index === 0) {
      return
    }
    const prevData = allData[index - 1]
    if (_.isEqual(data.rule, prevData.rule)) {
      data.sameHost = true
    }
  })
  return allData
}

type HTTPServerRuleTableProps = {
  server: httpserver.HTTPServer
  getPipeline: (name: string) => pipeline.Pipeline | undefined
  onViewYaml: (yaml: string) => void
}

function HTTPServerRuleTable(props: HTTPServerRuleTableProps) {
  const intl = useIntl()
  const { onViewYaml, getPipeline } = props
  const allRuleData = getAllHTTPServerRuleData(props.server)

  const tableHeads = [
    intl.formatMessage({ id: 'app.traffic.host' }),
    intl.formatMessage({ id: 'app.traffic.path' }),
    intl.formatMessage({ id: 'app.traffic.ipFilter' }),
    intl.formatMessage({ id: 'app.traffic.headers' }),
    intl.formatMessage({ id: 'app.traffic.methods' }),
    intl.formatMessage({ id: 'app.traffic.pipeline' }),
    intl.formatMessage({ id: 'app.general.actions' }),
  ]

  return (
    <Table size="small">
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
        {allRuleData.map((data, index) => {
          const pipeline = getPipeline(data.pipeline)

          return (
            <TableRow key={index}>
              {/* host */}
              <TableCell>
                {data.sameHost ? <Chip size="small" label={intl.formatMessage({ id: "app.traffic.host.sameAsAbove" })} /> :
                  <React.Fragment>
                    {data.hosts.map((host, index) => {
                      return <div key={`host-${index}`}>{host}</div>
                    })}
                    {data.hostRegexps.map((host, index) => {
                      return <div key={`hostRegexp-${index}`}>{host} <Chip size="small" label={"regexp"} /></div>
                    })}
                    {data.hosts.length === 0 && data.hostRegexps.length === 0 && <div>*</div>}
                  </React.Fragment>
                }
              </TableCell>


              {/* path */}
              <TableCell>
                {(data.path.length > 0) && <div>{data.path}</div>}
                {(data.pathPrefix.length > 0) && <div>{data.pathPrefix} <Chip size="small" label="prefix" /></div>}
                {(data.pathRegexp.length > 0) && <div>{data.pathRegexp} <Chip size="small" label="regexp" /></div>}
              </TableCell>

              {/* ipFilter */}
              <TableCell>
                {data.ipFilter ?
                  <Stack
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={1}
                  >
                    <Stack
                      direction="column"
                      justifyContent="center"
                      alignItems="flex-start"
                      spacing={0}
                    >
                      <div>allow {data.ipFilter.allowIPs ? data.ipFilter.allowIPs.length : 0}</div>
                      <div>block {data.ipFilter.blockIPs ? data.ipFilter.blockIPs.length : 0}</div>
                    </Stack>
                    <TextButton title={intl.formatMessage({ id: "app.general.actions.view" })} onClick={() => { onViewYaml(yaml.dump(data.ipFilter)) }} />
                  </Stack> :
                  <div>Disabled</div>
                }
              </TableCell>

              {/* headers */}
              <TableCell>
                {data.headers ?
                  <Stack
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={1}
                  >
                    <div>{data.headers.length}</div>
                    <TextButton title={intl.formatMessage({ id: "app.general.actions.view" })} onClick={() => { onViewYaml(yaml.dump(data.headers)) }} />
                  </Stack> :
                  <div>-</div>}
              </TableCell>

              {/* methods */}
              <TableCell>
                {data.methods ? <pre>{data.methods.join("\n")}</pre> : <div>*</div>}
              </TableCell>

              {/* pipeline */}
              <TableCell>
                {pipeline ?
                  <TextButton title={pipeline.name} onClick={() => { onViewYaml(yaml.dump(pipeline)) }} /> :
                  <Tooltip title={intl.formatMessage({ id: "app.general.noResult" })}>
                    <div>{data.pipeline}</div>
                  </Tooltip>
                }
              </TableCell>

              {/* actions */}
              <TableCell>
                <TextButton title={intl.formatMessage({ id: "app.general.actions.view" })} onClick={() => { onViewYaml(yaml.dump(data.rule)) }} />
              </TableCell>

            </TableRow>
          )
        })}
      </TableBody>
    </Table >
  )
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
    server: {} as httpserver.HTTPServer,
  })
  const onOpen = (server: httpserver.HTTPServer) => {
    setState({ open: true, server: server })
  }
  const onClose = () => {
    setState({ open: false, server: {} as httpserver.HTTPServer })
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
    server: {} as httpserver.HTTPServer,
    yaml: "",
  })
  const onOpen = (server: httpserver.HTTPServer) => {
    setState({ open: true, server: server, yaml: yaml.dump(server) })
  }
  const onClose = () => {
    setState({ open: false, server: {} as httpserver.HTTPServer, yaml: "" })
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