"use client"

import React, { Fragment } from "react"
import { useIntl } from "react-intl"

import { isNullOrUndefined } from "@/common/utils"
import { useClusters } from "../../context"

import { Box, CircularProgress, List, ListItem, ListItemText, Typography, } from "@mui/material"
import { SearchBarLayout, SearchText, SelectText, SwitchCluster } from "@/components/SearchBar"
import Paginations, { usePagination } from "@/components/Paginations"
import { useLogs } from "@/apis/hooks"
import ErrorAlert from "@/components/ErrorAlert"
import BlankPage from "@/components/BlankPage"

export default function Logs() {
  const intl = useIntl()
  const { currentCluster } = useClusters()
  const [search, setSearch] = React.useState("")
  const [tail, setTail] = React.useState(logLimitOptions[0].value)
  const { logs, error, isLoading, mutate } = useLogs(currentCluster, tail)

  return (
    <div>
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
      <LogContent logs={logs || ""} search={search} isLoading={isLoading} error={error} />
    </div>
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
      <List>
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
      <Paginations
        page={page}
        pageCount={pageCount}
        onPageChange={(page) => { setPage(page) }}
        pageSize={pageSize}
        pageSizeOptions={[50, 100, 150, 200]}
        onPageSizeChange={(pageSize) => { setPageSize(pageSize) }}
      />
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
