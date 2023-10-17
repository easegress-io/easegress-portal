"use client"

import React, { Fragment } from "react";
import { useIntl } from "react-intl"

import { catchErrorMessage, loadYaml } from '@/common/utils';
import { useSnackbar } from 'notistack';
import { ClusterType, EgctlConfig, MemberType, ValidateEgctlConfig, parseEgctlConfig } from "@/apis/cluster"
import clusterImage from '@/asserts/cluster.png'
import heartbeatSVG from '@/asserts/heartbeat.svg'
import nodeSVG from '@/asserts/node.svg'
import roleSVG from '@/asserts/role.svg'
import startSVG from '@/asserts/start.svg'
import { isNullOrUndefined } from "@/common/utils"
import { useClusters } from "../../context"

import { useClusterMembers } from "@/apis/hooks"
import ErrorAlert from "@/components/ErrorAlert"
import Spacer from "@/components/Spacer"
import YamlEditorDialog from "@/components/YamlEditorDialog"
import { Avatar, Button, Card, CardContent, CardHeader, Chip, CircularProgress, Grid, Paper, Stack, Typography } from "@mui/material"
import yaml from 'js-yaml'
import moment from 'moment'
import Image from 'next/image'
import { useRouter } from "next/navigation"
import YamlViewer from "@/components/YamlViewer"
import EditIcon from '@mui/icons-material/Edit';

export default function Clusters() {
  const { clusters } = useClusters()
  const intl = useIntl()
  const [createOpen, setCreateOpen] = React.useState(false)

  const manageButtons = [
    {
      icon: <EditIcon />,
      label: intl.formatMessage({ id: 'app.cluster.manage' }),
      onClick: () => { setCreateOpen(true) }
    },
  ]

  return (
    <div>
      <ManageBar buttons={manageButtons} ></ManageBar>
      <CreateDialog
        open={createOpen}
        onClose={() => { setCreateOpen(false) }}
      />
      <Grid container spacing={2}>
        {clusters.map((cluster) => (
          <Grid key={cluster.name} item xs={12}>
            <SingleCluster cluster={cluster} />
          </Grid>
        ))}
      </Grid>
    </div >
  )
}

function SingleCluster({ cluster }: { cluster: ClusterType }) {
  const intl = useIntl()
  const router = useRouter()
  const { setCurrentClusterName } = useClusters()
  const { members, error, isLoading } = useClusterMembers(cluster, { refreshInterval: 10000 })
  const [errExpand, setErrExpand] = React.useState(false)

  return (
    <Card elevation={1}>
      <CardHeader
        style={{ paddingBottom: 0 }}
        title={
          <div
            style={{
              fontSize: '20px',
              fontWeight: 600,
              lineHeight: '28px',
              color: '#2f54eb',
              cursor: 'pointer',
              width: 'fit-content'
            }}
            onClick={() => {
              router.push(`/traffic/`);
              setCurrentClusterName(cluster.name);
            }}
          >
            {cluster.name}
          </div>
        }
        titleTypographyProps={{ variant: 'h5' }}
        avatar={
          <Avatar
            variant="rounded"
            style={{ width: '24px', height: '24px', backgroundColor: 'white' }}
          >
            <Image src={clusterImage} alt="title" />
          </Avatar>
        }
      />

      <CardContent>
        <div style={{ margin: '0 0 5px 0' }}>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>
            {`${intl.formatMessage({ id: 'app.cluster.apiAddress' })}:`}
          </span>

          <Chip
            key={`${cluster.cluster.server}`}
            size="small"
            variant="outlined"
            style={{ margin: '0 0 0 8px' }}
            label={cluster.cluster.server}
          />
        </div>

        {isLoading && <CircularProgress />}

        {!isNullOrUndefined(error) && (
          <ErrorAlert error={error} expand={errExpand} onClose={() => { setErrExpand(!errExpand) }} />
        )}

        {/* useSWR may use same data state and switch when we change page.
        Anyway, members can be Objects for a short time when switch page */}
        {!isNullOrUndefined(members) && Array.isArray(members) &&
          <Grid container>
            {members!.map((member, index) => {
              return (
                <SingleClusterMember
                  key={index}
                  cluster={cluster}
                  member={member}
                />
              );
            })}
          </Grid>
        }
      </CardContent>
    </Card>
  );
}

type SingleClusterMemberProps = {
  cluster: ClusterType
  member: MemberType
}

function SingleClusterMember(props: SingleClusterMemberProps) {
  const { cluster, member } = props
  const intl = useIntl()
  const health = moment().diff(moment(member.lastHeartbeatTime), 'seconds') < 60
  const yamlDoc = yaml.dump(member)
  const [details, setDetails] = React.useState(false)

  const items = [
    { icon: roleSVG, label: intl.formatMessage({ id: 'app.cluster.role' }), value: member.options.ClusterRole },
    { icon: startSVG, label: intl.formatMessage({ id: 'app.cluster.start' }), value: moment(member.etcd.startTime).fromNow() },
    { icon: heartbeatSVG, label: intl.formatMessage({ id: 'app.cluster.heartbeat' }), value: moment(member.lastHeartbeatTime).fromNow() },
  ]

  return (
    <Paper style={{ width: '100%', margin: "16px 0 0 0", border: "1px solid #dee1e7" }} >
      <Stack direction={"row"}
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
        marginTop={2}
        marginBottom={2}
      >
        <div style={{ flexGrow: 1 }}>
          <Stack direction={"row"} spacing={2} marginLeft={2}>
            <Image src={nodeSVG} alt="node" />
            <div >
              <Stack direction={"column"}>
                <div>
                  <Stack direction={"row"} spacing={2}>
                    <div style={{ color: "#002b69", fontSize: "16px", fontWeight: 500 }} >{member.options.Name}</div>
                    <div>
                      {health ? (
                        <Chip size="small" label="Running" style={{ color: "#3a9305", backgroundColor: "#e0f7d2" }} />
                      ) : (
                        <Chip size="small" label="Unhealthy" style={{ color: "#ac2e00", backgroundColor: "#ffe5db" }} />
                      )}
                    </div>
                  </Stack>
                </div>
                <div style={{ color: "#6f7b8b", fontSize: "14px", fontWeight: 500 }}>{member.options.APIAddr}</div>
              </Stack>
            </div>
          </Stack>
        </div>

        <div>
          <Stack direction={"row"}
            justifyContent="space-around"
            alignItems="center"
            spacing={10}
            marginRight={3}
          >
            {items.map((item, index) => {
              return (
                <div key={index}>
                  <Stack direction={"row"} spacing={2} justifyContent="flex-start" alignItems="center">
                    <div>
                      <Image src={item.icon} alt={item.label}
                        style={{
                          width: "24px",
                          height: "24px",
                        }} />
                    </div>
                    <div>
                      <Stack direction={"column"}>
                        <div style={{
                          color: "#6f7b8b",
                          fontWeight: 500,
                        }}>
                          {item.label}
                        </div>
                        <div style={{
                          color: "#002b69",
                          fontWeight: 500,
                        }}>
                          {item.value}
                        </div>
                      </Stack>
                    </div>
                  </Stack>
                </div>
              )
            })}
            <Button variant="outlined" style={{ textTransform: "none" }} onClick={() => { setDetails(true) }}>Details</Button>
          </Stack>
        </div>
      </Stack >
      <YamlViewer
        open={details}
        onClose={() => { setDetails(false) }}
        title={`${cluster.name} - ${member.options.Name}`}
        yaml={yamlDoc}
      />
    </Paper >
  )
}

type SearchBarProps = {
  buttons?: {
    icon: React.ReactNode | undefined
    label: string
    onClick: () => void
  }[]
}

function ManageBar({ buttons }: SearchBarProps) {
  const { clusters, currentCluster, setCurrentClusterName } = useClusters()
  const intl = useIntl()

  return (
    <Card style={{ boxShadow: 'none' }}>
      <CardContent
        style={{
          // background: '#fafafa',
          borderRadius: '12px',
          padding: '16px',
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Grid
              container
              justifyContent="space-between"
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography flexGrow={1} />

              {buttons && buttons.map((button, index) => {
                return <Fragment key={index}>
                  <Spacer size={16} />
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={button.icon}
                    style={{
                      height: '40px',
                      lineHeight: '40px',
                      textTransform: 'none',
                      borderColor: '#DEDEDE',
                      background: '#fff',
                    }}
                    onClick={button.onClick}
                  >
                    {button.label}
                  </Button>
                </Fragment>
              })}
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

type CreateDialogProps = {
  open: boolean
  onClose: () => void
}

function CreateDialog({ open, onClose }: CreateDialogProps) {
  const intl = useIntl()

  const yamlValue = localStorage.getItem('easegress-rc-file')
  const [yamlDoc, setYamlDoc] = React.useState(yamlValue || '')
  const { enqueueSnackbar } = useSnackbar()

  const onYamlChange = (value: string | undefined, ev: any) => {
    setYamlDoc(value || '')
  }

  const { setClusters } = useClusters()


  const actions = [
    {
      label: intl.formatMessage({ id: 'app.cluster.save' }),
      onClick: () => {
        const { result, err } = loadYaml(yamlDoc)
        if (err !== "") {
          enqueueSnackbar(intl.formatMessage({ id: 'app.general.invalidYaml' }, { error: err }), { variant: 'error' })
          return
        }

        console.log(result)

        const egctlConfig = result as EgctlConfig
        const vaidateErr = ValidateEgctlConfig(egctlConfig)
        if (vaidateErr !== "") {
          enqueueSnackbar(intl.formatMessage({ id: 'app.general.invalidYaml' }, { error: vaidateErr }), { variant: 'error' })
          return
        }

        let parsedEgctlConfig = parseEgctlConfig(egctlConfig)

        setClusters(parsedEgctlConfig.clusters)

        localStorage.setItem('easegress-rc-file', yamlDoc)
        // egctlconfig to clusters
        // set local storage

        console.log(egctlConfig)


        onClose()
      }
    },
  ]

  return (
    <YamlEditorDialog
      open={open}
      onClose={onClose}
      title={intl.formatMessage({ id: 'app.cluster.manage' })}
      yaml={yamlDoc}
      onYamlChange={onYamlChange}
      actions={actions}
    />
  )
}