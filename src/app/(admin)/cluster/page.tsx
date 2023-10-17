"use client"

import React from "react";
import { useIntl } from "react-intl"

import { useSnackbar } from 'notistack';
import { ClusterType, EgctlConfig, MemberType, validateEgctlConfig, parseEgctlConfig } from "@/apis/cluster"
import clusterImage from '@/asserts/cluster.png'
import heartbeatSVG from '@/asserts/heartbeat.svg'
import nodeSVG from '@/asserts/node.svg'
import roleSVG from '@/asserts/role.svg'
import startSVG from '@/asserts/start.svg'
import { isNullOrUndefined, loadYaml } from "@/common/utils"
import { useClusters } from "../../context"

import { useClusterMembers } from "@/apis/hooks"
import ErrorAlert from "@/components/ErrorAlert"
import YamlEditorDialog from "@/components/YamlEditorDialog"
import { Avatar, Button, Card, CardContent, CardHeader, Chip, CircularProgress, Grid, Paper, Stack, Typography } from "@mui/material"
import yaml from 'js-yaml'
import moment from 'moment'
import Image from 'next/image'
import { useRouter } from "next/navigation"
import YamlViewer from "@/components/YamlViewer"
import EditIcon from '@mui/icons-material/Edit';
import { SearchBarLayout } from "@/components/SearchBar";

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
      <SearchBarLayout buttons={manageButtons} />
      <EditConfigDialog
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

type EditConfigDialogProps = {
  open: boolean
  onClose: () => void
}

function EditConfigDialog({ open, onClose }: EditConfigDialogProps) {
  const intl = useIntl()
  const { enqueueSnackbar } = useSnackbar()
  const { setClusters } = useClusters()

  const [yamlDoc, setYamlDoc] = React.useState('')
  const onYamlChange = (value: string | undefined, ev: any) => {
    setYamlDoc(value || '')
  }

  React.useEffect(() => {
    const yamlValue = localStorage.getItem('easegress-rc-file')
    setYamlDoc(yamlValue || '')
  }, [])

  const actions = [
    {
      label: intl.formatMessage({ id: 'app.cluster.save' }),
      onClick: () => {
        const { result, err } = loadYaml(yamlDoc)
        if (err !== "") {
          enqueueSnackbar(intl.formatMessage({ id: 'app.general.invalidYaml' }, { error: err }), { variant: 'error' })
          return
        }

        const egctlConfig = result as EgctlConfig
        const vaidateErr = validateEgctlConfig(egctlConfig)
        if (vaidateErr !== "") {
          enqueueSnackbar(intl.formatMessage({ id: 'app.general.invalidYaml' }, { error: vaidateErr }), { variant: 'error' })
          return
        }

        let parsedEgctlConfig = parseEgctlConfig(egctlConfig)
        setClusters(parsedEgctlConfig.clusters)
        localStorage.setItem('easegress-rc-file', yamlDoc)
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