import { httpserver, pipeline } from "@/apis/object"
import TextButton from "@/components/TextButton"
import { Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from "@mui/material"
import _ from 'lodash'
import React from "react"
import { useIntl } from "react-intl"
import yaml from 'js-yaml'

export function getHTTPTableData(server: httpserver.HTTPServer) {
  const hosts: string[] = []
  const hostRegexps: string[] = []
  server.rules?.forEach(rule => {
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
    name: server.name,
    kind: server.kind,
    hosts: _.uniq(hosts.filter(host => { return host !== "" })),
    hostRegexps: _.uniq(hostRegexps.filter(host => { return host !== "" })),
    port: server.port,
  }
}

export type HTTPServerRuleTableProps = {
  server: httpserver.HTTPServer
  getPipeline: (name: string) => pipeline.Pipeline | undefined
  onViewYaml: (yaml: string) => void
}

export function HTTPServerRuleTable(props: HTTPServerRuleTableProps) {
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