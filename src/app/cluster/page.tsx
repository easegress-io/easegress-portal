"use client"

import React from "react"
import { useIntl } from "react-intl"

import styles from './page.module.css';
import { useClusterMembers } from "./hooks"
import { useClusters, useCurrentCluster } from "../context"
import { ClusterType, MemberType } from "@/apis/cluster"
import { isNullOrUndefined } from "@/common/utils"
import clusterImage from '@/asserts/cluster.png'
import nodeSVG from '@/asserts/node.svg'
import roleSVG from '@/asserts/role.svg'
import startSVG from '@/asserts/start.svg'
import heartbeatSVG from '@/asserts/heartbeat.svg'

import moment from 'moment'
import Image from 'next/image'
import { useRouter } from "next/navigation"
import { Alert, Avatar, Card, CardContent, CardHeader, Chip, CircularProgress, Grid, Paper } from "@mui/material"


export default function Clusters() {
  const { clusters } = useClusters()
  return (
    <div>
      <Grid container spacing={2}>
        {clusters.map((cluster) => (
          <Grid key={cluster.name} item xs={12}>
            <SingleCluster cluster={cluster} />
          </Grid>
        ))}
      </Grid>
    </div>
  )
}

function SingleCluster({ cluster }: { cluster: ClusterType }) {
  const intl = useIntl()
  const router = useRouter()
  const { setCurrentClusterID } = useCurrentCluster()
  const { members, error, isLoading } = useClusterMembers(cluster)

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
              setCurrentClusterID(cluster.id);
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

          {cluster.apiAddresses.map((address) => (
            <Chip
              key={`${address}`}
              size="small"
              variant="outlined"
              style={{ margin: '0 0 0 8px' }}
              label={address}
            />
          ))}
        </div>

        {isLoading && <CircularProgress />}

        {!isNullOrUndefined(error) && (
          <Alert
            severity="error"
            style={{
              margin: '21px 0 0 0',
              display: 'flex',
              alignItems: 'center',
            }}>
            {error}
          </Alert>
        )}

        {!isNullOrUndefined(members) &&
          <Grid container>
            {[...members!, ...members!]!.map((member, index) => {
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
  return (
    <Paper elevation={0} className={styles["cluster-node-content"]}>
      <div className={styles["host-container"]}>
        <Image src={nodeSVG} alt="node" />

        <div className={styles["host-content-container"]}>
          <div className={styles["name-status-container"]}>
            <div className={styles["name-container"]}>{member.options.Name}</div>
            <div className={styles["status-container"]}>
              {health ? (
                <Chip
                  size="small"
                  label="Running"
                  className={styles["status-content-normal"]}
                />
              ) : (
                <Chip
                  size="small"
                  label="Unhealthy"
                  className={styles["status-content-danger"]}
                />
              )}
            </div>
          </div>
          <div className={styles["address-container"]}>{member.options.APIAddr}</div>
        </div>
      </div>

      <div className={styles["items-container"]}>
        <div className={styles["item-container"]}>
          <Image src={roleSVG} alt="role" />

          <div className={styles["item-content-container"]}>
            <div className={styles["title-container"]}>
              {intl.formatMessage({ id: 'app.traffic.cluster.label.role' })}
            </div>
            <div className={styles["value-container"]}>{member.options.ClusterRole}</div>
          </div>
        </div>

        <div className={styles["item-container"]}>
          <Image src={startSVG} alt="start" />

          <div className={styles["item-content-container"]}>
            <div className={styles["title-container"]}>
              {intl.formatMessage({ id: 'app.traffic.cluster.label.start' })}
            </div>
            <div className={styles["value-container"]}>
              {moment(member.etcd.startTime).fromNow()}
            </div>
          </div>
        </div>

        <div className={styles["item-container"]}>
          <Image src={heartbeatSVG} alt="heartbeat" />

          <div className={styles["item-content-container"]}>
            <div className={styles["title-container"]}>
              {intl.formatMessage({
                id: 'app.traffic.cluster.label.heartbeat',
              })}
            </div>
            <div className={styles["value-container"]}>{moment(member.lastHeartbeatTime).fromNow()}</div>
          </div>
        </div>
      </div>
    </Paper>
  )
}
