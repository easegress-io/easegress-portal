"use client"

import React from "react"
import { useIntl } from "react-intl"

import { ClusterType, MemberType, getLogs } from "@/apis/cluster"
import clusterImage from '@/asserts/cluster.png'
import heartbeatSVG from '@/asserts/heartbeat.svg'
import nodeSVG from '@/asserts/node.svg'
import roleSVG from '@/asserts/role.svg'
import startSVG from '@/asserts/start.svg'
import { catchErrorMessage, isNullOrUndefined } from "@/common/utils"
import { useClusters } from "../../context"

import { useClusterMembers } from "@/apis/hooks"
import ErrorAlert from "@/components/ErrorAlert"
import YamlEditorDialog from "@/components/YamlEditorDialog"
import { Avatar, Button, Card, CardContent, CardHeader, Chip, CircularProgress, Grid, List, ListItem, ListItemText, Pagination, Paper, Stack, Typography, } from "@mui/material"
import yaml from 'js-yaml'
import moment from 'moment'
import Image from 'next/image'
import { useRouter } from "next/navigation"
import YamlViewer from "@/components/YamlViewer"
import { SearchBarLayout, SearchText, SelectText, SwitchCluster } from "@/components/SearchBar"
import { useSnackbar } from "notistack"
import LoopIcon from '@mui/icons-material/Loop';
import Paginations from "@/components/Paginations"

export default function Logs() {
  const intl = useIntl()
  const { currentCluster } = useClusters()
  const { enqueueSnackbar } = useSnackbar()
  const [search, setSearch] = React.useState("")

  const [tail, setTail] = React.useState(logLimitOptions[0].value)
  const [logs, setLogs] = React.useState([] as string[])
  const filteredLogs = search === "" ? logs : logs.filter(l => l.includes(search))

  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(50)
  const pageCount = Math.ceil(filteredLogs.length / pageSize)
  const [refresh, setRefresh] = React.useState(false)

  const getCurrentLogs = () => {
    let start = filteredLogs.length - page * pageSize
    if (start < 0) {
      start = 0
    }
    return filteredLogs.slice(start, start + pageSize).reverse()
  }

  const doRefresh = () => {
    setRefresh(!refresh)
  }

  React.useEffect(() => {
    setPage(1)
    getLogs(currentCluster, tail).then(res => {
      setLogs(res.split("\n"))
      enqueueSnackbar(intl.formatMessage({ id: "app.log.getLogSuccess" }), { variant: 'success' })
    }).catch(err => {
      enqueueSnackbar(intl.formatMessage({ id: "app.log.getLogFailed" }, { error: catchErrorMessage(err) }), { variant: 'error' })
    })
  }, [tail, refresh])

  React.useEffect(() => {
    setPage(1)
  }, [pageCount])

  return (
    <div>
      <SearchBarLayout
        contents={[
          <SwitchCluster />,
          <SelectText
            label={intl.formatMessage({ id: "app.log.limit" })}
            options={logLimitOptions}
            value={tail}
            onChange={(value: number | string) => { setTail(parseInt(value as string, 10)) }}
          />,
          <SearchText
            search={search}
            onSearchChange={(value: string) => { setSearch(value) }}
          />,
        ]}
        buttons={[
          {
            label: intl.formatMessage({ id: "app.log.refresh" }),
            onClick: () => { doRefresh() },
          },
        ]}
      />
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
    </div>
  )
}

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
  "WARN": "warning",
  "DEBUG": "info",
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
