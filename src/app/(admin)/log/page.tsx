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

import React, { Fragment } from "react"
import { useIntl } from "react-intl"

import { isNullOrUndefined } from "@/common/utils"
import { useClusters } from "../../context"

import { Box, Card, CircularProgress, List, ListItem, ListItemText, Typography, } from "@mui/material"
import { SearchBarLayout, SearchText, SelectText, SwitchCluster } from "@/components/SearchBar"
import Paginations, { usePagination } from "@/components/Paginations"
import { useLogs } from "@/apis/hooks"
import ErrorAlert from "@/components/ErrorAlert"
import BlankPage from "@/components/BlankPage"
import { borderValue } from "@/app/style"

export default function Logs() {
  const intl = useIntl()
  const { currentCluster } = useClusters()
  const [search, setSearch] = React.useState("")
  const [tail, setTail] = React.useState(logLimitOptions[0].value)
  const { logs, error, isLoading, mutate } = useLogs(currentCluster, tail)

  return (
    <Card style={{ boxShadow: "none" }}>
      <Box marginLeft={"24px"} marginRight={"24px"} marginTop={"24px"} marginBottom={"24px"}>
        <SearchBarLayout
          contents={[
            <SwitchCluster key={"switch-cluster"} />,
            <SelectText
              key={"log-limit"}
              label={intl.formatMessage({ id: "app.log.limit" })}
              options={logLimitOptions}
              value={tail}
              onChange={(value: number | string) => { setTail(parseInt(value as string, 10)) }}
            />,
            <SearchText
              key={"search"}
              search={search}
              onSearchChange={(value: string) => { setSearch(value) }}
            />,
          ]}
          buttons={[
            {
              label: intl.formatMessage({ id: "app.log.refresh" }),
              onClick: () => { mutate() },
            },
          ]}
        />
        <Box marginTop={"20px"}>
          <LogContent logs={logs || ""} search={search} isLoading={isLoading} error={error} />
        </Box>
      </Box>
    </Card>
  )
}

type LogContentProps = {
  logs: string
  isLoading: boolean
  error: any
  search: string
}

function LogContent(props: LogContentProps) {
  const intl = useIntl()

  const { logs, search, isLoading, error } = props
  const logArray = logs ? logs.split("\n") : []
  const filteredLogs = search === "" ? logArray : logArray.filter(l => l.includes(search))

  const { page, setPage, pageSize, setPageSize, pageCount } = usePagination(filteredLogs.length, logPageSizeOptions[0])

  const getCurrentLogs = () => {
    let start = filteredLogs.length - page * pageSize
    if (start < 0) {
      start = 0
    }
    return filteredLogs.slice(start, start + pageSize).reverse()
  }

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

  if (filteredLogs.length === 0) {
    return <BlankPage description={intl.formatMessage({ id: "app.general.noResult" })} />
  }

  return (
    <Fragment>
      <List
        style={{
          border: borderValue,
          borderRadius: "4px",
        }}
      >
        {getCurrentLogs().map((l, index) => {
          return (
            <ListItem key={index}>
              <ListItemText>
                <Typography color={getLogColor(l)}>{l}</Typography>
              </ListItemText>
            </ListItem>
          )
        })}
      </List>
      <Box marginTop={"10px"}>
        <Paginations
          page={page}
          pageCount={pageCount}
          onPageChange={(page) => { setPage(page) }}
          pageSize={pageSize}
          pageSizeOptions={[50, 100, 150, 200]}
          onPageSizeChange={(pageSize) => { setPageSize(pageSize) }}
        />
      </Box>
    </Fragment >
  )
}

const logPageSizeOptions = [50, 100, 150, 200, 500]

const logLimitOptions = [
  { label: "500", value: 500 },
  { label: "1000", value: 1000 },
  { label: "2000", value: 2000 },
  { label: "3000", value: 3000 },
  { label: "4000", value: 4000 },
  { label: "5000", value: 5000 },
]

const logColor = {
  "INFO": "primary",
  "ERROR": "error",
  "WARN": "primary",
  "DEBUG": "primary",
} as {
  [key: string]: string
}

const getLogColor = (log: string): string => {
  const regexp = /(INFO|ERROR|WARN|DEBUG)/g;
  const match = regexp.exec(log)
  if (isNullOrUndefined(match)) {
    return "primary"
  }
  return logColor[match![0]] || "primary"
}
