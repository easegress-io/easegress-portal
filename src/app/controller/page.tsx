"use client"

import { useObjects } from "@/apis/hooks"
import { useClusters } from "../context"
import React from "react"
import { Object, Objects, createObject, deleteObject, getObjectStatus, updateObject } from "@/apis/object"
import { Box, Chip, CircularProgress, Collapse, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material"
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
import yaml from "js-yaml"
import SimpleDialog from "@/components/SimpleDialog"

export default function Controller() {
  const intl = useIntl()
  const { currentCluster } = useClusters()
  const [search, setSearch] = React.useState("")
  const [createControllerOpen, setCreateControllerOpen] = React.useState(false)

  const { objects, error, isLoading, mutate } = useObjects(currentCluster)

  const searchBarButtons = [
    {
      icon: <AddIcon />,
      label: intl.formatMessage({ id: 'app.controller.createController' }),
      onClick: () => { setCreateControllerOpen(true) }
    },
  ]

  return (
    <div>
      <SearchBar search={search} onSearchChange={(value: string) => { setSearch(value) }} buttons={searchBarButtons} />
      <CreateController open={createControllerOpen} onClose={() => { setCreateControllerOpen(false) }} cluster={currentCluster} mutate={mutate} />
      <ControllerContent cluster={currentCluster} objects={objects} error={error} isLoading={isLoading} mutate={mutate} search={search} />
    </div>
  )
}

type TableData = {
  name: string
  kind: string
}

function getTableData(controller: Object): TableData {
  return {
    name: controller.name,
    kind: controller.kind
  }
}

type ControllerContentProps = {
  cluster: ClusterType
  objects: Objects | undefined
  search: string
  error: any
  isLoading: boolean
  mutate: () => void
}

function ControllerContent(props: ControllerContentProps) {
  const intl = useIntl()
  const { enqueueSnackbar } = useSnackbar()
  const { cluster, objects, error, isLoading, mutate, search } = props
  const controllers = objects?.others || []

  const viewYaml = useViewYaml()

  const deleteController = useDeleteController()
  const confirmDeleteController = () => {
    const s = deleteController.contoller
    deleteController.onClose()
    deleteObject(cluster, s.name).then(() => {
      mutate()
      enqueueSnackbar(intl.formatMessage({ id: "app.general.deleteSuccess" }, { kind: s.kind, name: s.name }), { variant: 'success' })
    }).catch(err => {
      enqueueSnackbar(intl.formatMessage({ id: "app.general.deleteFailed" }, { kind: s.kind, name: s.name, error: catchErrorMessage(err) }), { variant: 'error' })
    })
  }

  const editController = useEditController()
  const handleEditController = () => {
    const s = editController.controller
    editController.onClose()
    const { result, err } = loadYaml(editController.yaml)
    if (err !== "") {
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.invalidYaml' }, { error: err }), { variant: 'error' })
      return
    }
    if (result.kind !== s.kind || result.name !== s.name) {
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.editChangeNameOrKind' }), { variant: 'error' })
      return
    }
    updateObject(cluster, s, editController.yaml).then(() => {
      mutate()
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.editSuccess' }, { kind: s.kind, name: s.name }), { variant: 'success' })
    }).catch(err => {
      enqueueSnackbar(intl.formatMessage({ id: 'app.general.editFailed' }, { kind: s.kind, name: s.name, error: catchErrorMessage(err) }), { variant: 'error' })
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
      onClick: (controller: Object) => {
        editController.onOpen(controller)
      }
    },
    {
      // view yaml
      label: intl.formatMessage({ id: "app.general.actions.yaml" }),
      onClick: (controller: Object) => {
        viewYaml.onOpen(yaml.dump(controller))
      }
    },
    {
      // status
      label: intl.formatMessage({ id: "app.general.actions.status" }),
      onClick: (controller: Object) => {
        getObjectStatus(cluster, controller.name).then((status) => {
          viewYaml.onOpen(yaml.dump(status))
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
      onClick: (controller: Object) => {
        deleteController.onOpen(controller)
      },
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
              <TableCell style={{ flex: 1 }}>{intl.formatMessage({ id: 'app.general.kind' })} </TableCell>
              <TableCell style={{ width: "350px" }}>{intl.formatMessage({ id: 'app.general.actions' })} </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {controllers.map((controller, index) => {
              return (
                <ControllerTableRow key={index} controller={controller} actions={actions} openViewYaml={viewYaml.onOpen} />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {/* view only */}
      <YamlEditorDialog
        open={viewYaml.open}
        onClose={viewYaml.onClose}
        title={intl.formatMessage({ id: "app.general.actions.view" })}
        yaml={viewYaml.yaml}
        onYamlChange={() => { }}
        editorOptions={{ readOnly: true }}
      />
      {/* delete */}
      <SimpleDialog
        open={deleteController.open}
        onClose={deleteController.onClose}
        title={intl.formatMessage({ id: "app.general.deleteConfirm" })}
        actions={[{
          label: intl.formatMessage({ id: "app.general.actions.delete" }),
          onClick: confirmDeleteController,
          style: {
            color: "error",
          }
        }]}
      />
      {/* edit */}
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
    </Paper >
  )
}

type ControllerTableRowProps = {
  controller: Object
  openViewYaml: (yaml: string) => void
  actions: {
    label: string
    onClick: (controller: Object) => void
    color?: string
  }[]
}

function ControllerTableRow(props: ControllerTableRowProps) {
  const { controller: controller, actions, openViewYaml } = props
  const data = getTableData(controller)

  return (
    <React.Fragment>
      <TableRow hover role="checkbox">
        {/* name */}

        <TableCell>{data.name}</TableCell>
        <TableCell>{data.kind}</TableCell>

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
                onClick={() => { action.onClick(controller) }}
                title={action.label}
                color={action.color}
              />
            })}
          </Stack>
        </TableCell>
      </TableRow>
    </React.Fragment >
  )
}


type CreateControllerDialogProps = {
  open: boolean
  onClose: () => void
  cluster: ClusterType
  mutate: () => void
}

function CreateController({ open, onClose, cluster, mutate }: CreateControllerDialogProps) {
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

        createObject(cluster, yamlDoc).then(() => {
          mutate()
          onClose()
          enqueueSnackbar(intl.formatMessage({ id: 'app.general.createSuccess' }, { kind: object.kind, name: object.name }), { variant: 'success' })
        }).catch((err) => {
          enqueueSnackbar(intl.formatMessage({ id: 'app.general.createFailed' }, { kind: object.kind, name: object.name, error: catchErrorMessage(err) }), { variant: 'error' })
        })
      }
    },
  ]

  return (
    <YamlEditorDialog
      open={open}
      onClose={onClose}
      title={intl.formatMessage({ id: 'app.controller.createController' })}
      yaml={yamlDoc}
      onYamlChange={onYamlChange}
      actions={actions}
    />
  )
}

function useViewYaml() {
  const [state, setState] = React.useState({
    open: false,
    yaml: "",
  })
  const onClose = () => {
    setState({ open: false, yaml: "" })
  }
  const onOpen = (yaml: string) => {
    setState({ open: true, yaml: yaml })
  }
  return {
    open: state.open,
    yaml: state.yaml,
    onClose,
    onOpen,
  }
}

function useDeleteController() {
  const [state, setState] = React.useState({
    open: false,
    controller: {} as Object,
  })
  const onOpen = (controller: Object) => {
    setState({ open: true, controller: controller })
  }
  const onClose = () => {
    setState({ open: false, controller: {} as Object })
  }
  return {
    open: state.open,
    contoller: state.controller,
    onOpen,
    onClose,
  }
}

function useEditController() {
  const [state, setState] = React.useState({
    open: false,
    controller: {} as Object,
    yaml: "",
  })
  const onOpen = (controller: Object) => {
    setState({ open: true, controller: controller, yaml: yaml.dump(controller) })
  }
  const onClose = () => {
    setState({ open: false, controller: {} as Object, yaml: "" })
  }
  const onChange = (value: string | undefined, ev: any) => {
    setState({ ...state, yaml: value || "" })
  }
  return {
    open: state.open,
    controller: state.controller,
    yaml: state.yaml,
    onOpen,
    onClose,
    onChange,
  }
}