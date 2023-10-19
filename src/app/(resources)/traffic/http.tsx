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

import { httpserver, pipeline } from "@/apis/object"
import TextButton from "@/components/TextButton"
import { Chip, Stack, TableRow, Tooltip } from "@mui/material"
import _ from 'lodash'
import React from "react"
import { useIntl } from "react-intl"
import yaml from 'js-yaml'
import { ResourceTable, TableBodyCell } from "../common"

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

  const headers = [
    { text: intl.formatMessage({ id: 'app.traffic.host' }), },
    { text: intl.formatMessage({ id: 'app.traffic.path' }), },
    { text: intl.formatMessage({ id: 'app.traffic.ipFilter' }), },
    { text: intl.formatMessage({ id: 'app.traffic.headers' }), },
    { text: intl.formatMessage({ id: 'app.traffic.methods' }), },
    { text: intl.formatMessage({ id: 'app.traffic.pipeline' }), },
    { text: intl.formatMessage({ id: 'app.general.actions' }), },
  ]
  return (
    <ResourceTable headers={headers}>
      {allRuleData.map((data, index) => {
        const pipeline = getPipeline(data.pipeline)

        return (
          <TableRow key={index}>
            {/* host */}
            <TableBodyCell>
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
            </TableBodyCell>


            {/* path */}
            <TableBodyCell>
              {(data.path.length > 0) && <div>{data.path}</div>}
              {(data.pathPrefix.length > 0) && <div>{data.pathPrefix} <Chip size="small" label="prefix" /></div>}
              {(data.pathRegexp.length > 0) && <div>{data.pathRegexp} <Chip size="small" label="regexp" /></div>}
            </TableBodyCell>

            {/* ipFilter */}
            <TableBodyCell>
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
            </TableBodyCell>

            {/* headers */}
            <TableBodyCell>
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
            </TableBodyCell>

            {/* methods */}
            <TableBodyCell>
              {data.methods ? <pre>{data.methods.join("\n")}</pre> : <div>*</div>}
            </TableBodyCell>

            {/* pipeline */}
            <TableBodyCell>
              {pipeline ?
                <TextButton title={pipeline.name} onClick={() => { onViewYaml(yaml.dump(pipeline)) }} /> :
                <Tooltip title={intl.formatMessage({ id: "app.general.noResult" })}>
                  <div>{data.pipeline}</div>
                </Tooltip>
              }
            </TableBodyCell>

            {/* actions */}
            <TableBodyCell>
              <TextButton title={intl.formatMessage({ id: "app.general.actions.view" })} onClick={() => { onViewYaml(yaml.dump(data.rule)) }} />
            </TableBodyCell>
          </TableRow>
        )
      })}
    </ResourceTable>
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