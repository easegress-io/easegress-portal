"use client"

import { useObjects } from "@/apis/hooks"
import { useClusters } from "@/app/context"
import React, { Fragment } from "react"
import { EGObject, getObjectStatus, updateObject } from "@/apis/object"
import { Box, Chip, CircularProgress, Stack, TableRow } from "@mui/material"
import { useIntl } from "react-intl"
import YamlEditorDialog from "@/components/YamlEditorDialog"
import { useSnackbar } from "notistack"
import { catchErrorMessage, loadYaml } from "@/common/utils"
import BlankPage from "@/components/BlankPage"
import ErrorAlert from "@/components/ErrorAlert"
import _ from 'lodash'
import TextButton from "@/components/TextButton"
import yaml from "js-yaml"
import { useResourcesContext } from "../context"
import { useEditResource } from "../hooks"
import { primaryColor } from "@/app/style"
import { ResourceTable, TableBodyCell } from "../common"

export default function Controller() {
  const { currentCluster } = useClusters()
  const { search, openViewYaml, openDeleteResource } = useResourcesContext()
  const { objects, error, isLoading, mutate } = useObjects(currentCluster)
  const intl = useIntl()
  const { enqueueSnackbar } = useSnackbar()
  const controllers = objects?.others.filter(o => {
    return o.name.includes(search)
  }) || []

  const editController = useEditResource()
  const handleEditController = () => {
    const resource = editController.resource
    editController.onClose()
    const { result, err } = loadYaml(editController.yaml)
    if (err !== "") {
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.invalidYaml' }, { error: err }), { variant: 'error' })
      return
    }
    if (result.kind !== resource.kind || result.name !== resource.name) {
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.editChangeNameOrKind' }), { variant: 'error' })
      return
    }
    updateObject(currentCluster, resource, editController.yaml).then(() => {
      mutate()
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.editSuccess' }, { kind: resource.kind, name: resource.name }), { variant: 'success' })
    }).catch(err => {
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.editFailed' }, { kind: resource.kind, name: resource.name, error: catchErrorMessage(err) }), { variant: 'error' })
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
  if (controllers.length === 0) {
    return <BlankPage description={intl.formatMessage({ id: "app.general.noResult" })} />
  }

  const actions = [
    {
      // edit
      label: intl.formatMessage({ id: "app.general.actions.edit" }),
      onClick: (controller: EGObject) => {
        editController.onOpen(controller)
      }
    },
    {
      // view yaml
      label: intl.formatMessage({ id: "app.general.actions.yaml" }),
      onClick: (controller: EGObject) => {
        openViewYaml(yaml.dump(controller))
      }
    },
    {
      // status
      label: intl.formatMessage({ id: "app.general.actions.status" }),
      onClick: (controller: EGObject) => {
        getObjectStatus(currentCluster, controller.name).then((status) => {
          openViewYaml(yaml.dump(status))
        }).catch(err => {
          enqueueSnackbar(intl.formatMessage(
            { id: 'app.general.getStatusFailed' },
            { kind: controller.kind, name: controller.name, error: catchErrorMessage(err) }
          ), { variant: 'error' })
        })
      }
    },
    {
      // delete
      label: intl.formatMessage({ id: "app.general.actions.delete" }),
      onClick: (controller: EGObject) => {
        openDeleteResource(controller)
      },
      color: "error",
    },
  ]

  const headers = [
    { text: intl.formatMessage({ id: 'app.general.name' }), style: { width: "350px" } },
    { text: intl.formatMessage({ id: 'app.general.kind' }), style: { flex: 1 } },
    { text: intl.formatMessage({ id: 'app.general.actions' }), style: { width: "350px" } },
  ]
  return (
    <Fragment>
      <ResourceTable headers={headers}>
        {controllers.map((controller, index) => {
          return (
            <ControllerTableRow key={index} controller={controller} actions={actions} openViewYaml={openViewYaml} />
          );
        })}
      </ResourceTable>
      <YamlEditorDialog
        open={editController.open}
        onClose={editController.onClose}
        title={intl.formatMessage({ id: "app.general.actions.edit" })}
        yaml={editController.yaml}
        onYamlChange={(value, ev) => { editController.onChange(value, ev) }}
        actions={[
          {
            label: intl.formatMessage({ id: "app.general.actions.edit" }),
            onClick: handleEditController,
          }
        ]}
      />
    </Fragment>
  )
}

type TableData = {
  name: string
  kind: string
}

function getTableData(controller: EGObject): TableData {
  return {
    name: controller.name,
    kind: controller.kind
  }
}

type ControllerTableRowProps = {
  controller: EGObject
  openViewYaml: (yaml: string) => void
  actions: {
    label: string
    onClick: (controller: EGObject) => void
    color?: string
  }[]
}

function ControllerTableRow(props: ControllerTableRowProps) {
  const { controller: controller, actions } = props
  const data = getTableData(controller)

  return (
    <React.Fragment>
      <TableRow hover role="checkbox">
        {/* name */}
        <TableBodyCell>{data.name}</TableBodyCell>
        {/* kind */}
        <TableBodyCell>
          <Chip label={data.kind} style={{ color: primaryColor }} variant="outlined" size="small" />
        </TableBodyCell>

        {/* actions */}
        <TableBodyCell style={{ borderBottom: "none" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            {actions.map((action, index) => {
              return <TextButton
                key={index}
                onClick={() => { action.onClick(controller) }}
                title={action.label}
                color={action.color}
              />
            })}
          </Stack>
        </TableBodyCell>
      </TableRow>
    </React.Fragment >
  )
}
