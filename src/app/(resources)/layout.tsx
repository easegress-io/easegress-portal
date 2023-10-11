"use client"

import { mutate } from 'swr';
import { useClusters } from "../context"
import SearchBar from '@/components/SearchBar';
import { createObject } from '@/apis/object';
import { useIntl } from 'react-intl';
import React from 'react';
import { useSnackbar } from 'notistack';
import { catchErrorMessage, loadYaml } from '@/common/utils';
import AddIcon from '@mui/icons-material/Add';
import { ClusterType } from '@/apis/cluster';
import { getObjectsSWRKey } from '@/apis/hooks';
import YamlEditorDialog from '@/components/YamlEditorDialog';
import { ResourceContext } from './context';

export default function Layout({ children, }: { children: React.ReactNode }) {
  const { currentCluster } = useClusters()
  const intl = useIntl()
  const [search, setSearch] = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)

  const searchBarButtons = [
    {
      icon: <AddIcon />,
      label: intl.formatMessage({ id: 'app.general.actions.create' }),
      onClick: () => { setCreateOpen(true) }
    },
  ]

  return (
    <div>
      <SearchBar search={search} onSearchChange={(value: string) => { setSearch(value) }} buttons={searchBarButtons} />
      <CreateDialog
        open={createOpen}
        onClose={() => { setCreateOpen(false) }}
        cluster={currentCluster}
        mutate={() => { mutate(getObjectsSWRKey(currentCluster)) }}
      />
      <ResourceContext.Provider value={{ search, setSearch }}>
        {children}
      </ResourceContext.Provider>
    </div>
  )
}

type CreateDialogProps = {
  open: boolean
  onClose: () => void
  cluster: ClusterType
  mutate: () => void
}

function CreateDialog({ open, onClose, cluster, mutate }: CreateDialogProps) {
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
        const egObject = result as {
          name: string
          kind: string
        }
        createObject(cluster, yamlDoc).then(() => {
          mutate()
          onClose()
          enqueueSnackbar(intl.formatMessage({ id: 'app.general.createSuccess' }, { kind: egObject.kind, name: egObject.name }), { variant: 'success' })
        }).catch((err) => {
          enqueueSnackbar(intl.formatMessage({ id: 'app.general.createFailed' }, { kind: egObject.kind, name: egObject.name, error: catchErrorMessage(err) }), { variant: 'error' })
        })
      }
    },
  ]

  return (
    <YamlEditorDialog
      open={open}
      onClose={onClose}
      title={intl.formatMessage({ id: 'app.general.actions.create' })}
      yaml={yamlDoc}
      onYamlChange={onYamlChange}
      actions={actions}
    />
  )
}
