"use client"

import { useObjects } from "@/apis/hooks"
import { useClusters } from "../context"
import { Editor } from "@monaco-editor/react"
import React from "react"
import { createObject } from "@/apis/object"
import { Autocomplete, Button, Card, CardContent, Grid, IconButton, InputAdornment, TextField } from "@mui/material"
import importSVG from '@/asserts/import.svg'
import Image from "next/image"
import { useIntl } from "react-intl"
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import Spacer from "@/components/Spacer"
import SearchBar from "@/components/SearchBar"

export default function Traffic() {
  const intl = useIntl()
  const [search, setSearch] = React.useState("")
  const { clusters, currentCluster, setCurrentClusterID } = useClusters()
  const { objects, error, isLoading, mutate } = useObjects(currentCluster)
  const [objectYaml, setObjectYaml] = React.useState('')

  const buttons = [
    <Button
      variant="outlined"
      color="primary"
      startIcon={<AddIcon />}
      style={{
        height: '40px',
        lineHeight: '40px',
        textTransform: 'none',
        borderColor: '#DEDEDE',
        background: '#fff',
      }}
      onClick={() => {
      }}
    >
      {intl.formatMessage({
        id: 'app.traffic.createServer',
      })}
    </Button>
  ]

  return (
    <div>
      {currentCluster.name}
      {search}
      <SearchBar search={search} onSearchChange={(value: string) => { setSearch(value) }} buttons={buttons} />
    </div>
  )
}
