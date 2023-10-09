"use client"

import { useObjects } from "@/apis/hooks"
import { useClusters } from "../context"
import React from "react"
import { Object, Objects, createObject, httpserver, pipeline } from "@/apis/object"
import { Alert, Box, Button, ButtonBase, Chip, CircularProgress, Collapse, IconButton, List, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
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
import { Tab } from "@mui/base"
import yaml from "js-yaml"

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

function TrafficContent(props: TrafficContentProps) {
  const intl = useIntl()
  const { cluster, objects, error, isLoading, mutate, search } = props
  const httpServers = objects?.httpServers.filter(server => { return server.name.includes(search) }) || []
  const pipelines = objects?.pipelines || []
  const [expandValues, setExpandValues] = React.useState<{ [key: string]: boolean }>({})

  const getExpandValue = (server: httpserver.HTTPServer) => {
    return expandValues[server.name] || false
  }
  const setExpandValue = (server: httpserver.HTTPServer, value: boolean) => {
    setExpandValues({ ...expandValues, [server.name]: value })
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
      label: intl.formatMessage({ id: "app.general.actions.edit" }),
      onClick: () => { }
    },
    {
      label: intl.formatMessage({ id: "app.general.actions.yaml" }),
      onClick: () => { }
    },
    {
      label: intl.formatMessage({ id: "app.general.actions.status" }),
      onClick: () => { }
    },
    {
      label: intl.formatMessage({ id: "app.general.actions.delete" }),
      onClick: () => { },
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
              const data = getTableData(server)
              const open = getExpandValue(server)
              return (
                <TrafficTableRow key={index} server={server} open={open} setOpen={setExpandValue} actions={actions} />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper >
  )
}

type TrafficTableRowProps = {
  server: httpserver.HTTPServer
  open: boolean
  setOpen: (server: httpserver.HTTPServer, open: boolean) => void
  actions: {
    label: string
    onClick: () => void
    color?: string
  }[]
}

function TrafficTableRow(props: TrafficTableRowProps) {
  const { server, open, setOpen, actions } = props
  const data = getTableData(server)

  return (
    <React.Fragment>
      <TableRow hover role="checkbox">
        {/* name */}
        <TableCell>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton size="small" onClick={() => { setOpen(server, !open) }}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
            <Image
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '1px solid #dedede',
              }}
              src={easegressSVG}
              alt="Easegres" />
            <div>{data.name}</div>
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
                onClick={action.onClick}
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
              <HTTPServerRuleTable server={server} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment >
  )
}

type HTTPServerRuleData = {
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
    if (prevData.hosts.length === 0 && prevData.hostRegexps.length === 0) {
      return
    }
    if (_.isEqual(data.hosts, prevData.hosts) && _.isEqual(data.hostRegexps, prevData.hostRegexps)) {
      data.sameHost = true
    }
  })
  return allData
}

type HTTPServerRuleTableProps = {
  server: httpserver.HTTPServer
}

function HTTPServerRuleTable(props: HTTPServerRuleTableProps) {
  const intl = useIntl()
  const allRuleData = getAllHTTPServerRuleData(props.server)
  const [viewYaml, setViewYaml] = React.useState({
    open: false,
    yaml: "",
  })

  const onCloseViewYaml = () => {
    setViewYaml({ open: false, yaml: "" })
  }

  const onOpenViewYaml = (yaml: string) => {
    setViewYaml({ open: true, yaml: yaml })
  }

  const tableHeads = [
    intl.formatMessage({ id: 'app.traffic.host' }),
    intl.formatMessage({ id: 'app.traffic.path' }),
    intl.formatMessage({ id: 'app.traffic.ipFilter' }),
    intl.formatMessage({ id: 'app.traffic.headers' }),
    intl.formatMessage({ id: 'app.traffic.methods' }),
    intl.formatMessage({ id: 'app.traffic.pipeline' }),
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
          return (
            <TableRow key={index}>
              {/* host */}
              <TableCell>
                {data.sameHost ? <Chip size="small" label="same as above" /> :
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
                    <TextButton title="view" onClick={() => { onOpenViewYaml(yaml.dump(data.ipFilter)) }} />
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
                    <TextButton title="view" onClick={() => { onOpenViewYaml(yaml.dump(data.headers)) }} />
                  </Stack> :
                  <div>-</div>}
              </TableCell>

              {/* methods */}
              <TableCell>
                {data.methods ? <pre>{data.methods.join("\n")}</pre> : <div>*</div>}
              </TableCell>

              {/* pipeline */}
              <TableCell>
                {data.pipeline}
              </TableCell>

            </TableRow>
          )
        })}
      </TableBody>
      <YamlEditorDialog
        open={viewYaml.open}
        onClose={onCloseViewYaml}
        title={"view yaml"}
        yaml={viewYaml.yaml}
        onYamlChange={() => { }}
        editorOptions={{ readOnly: true }}
      />
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