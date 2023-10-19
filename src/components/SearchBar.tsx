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

import { useClusters } from "@/app/context";
import { Autocomplete, Button, Card, CardContent, Grid, IconButton, InputAdornment, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Spacer from "@/components/Spacer"
import React, { Fragment } from "react";
import { borderValue, primaryColor } from "@/app/style";
import TextTypo from "./TextTypo";

export type SearchBarProps = {
  search: string
  onSearchChange: (search: string) => void
  buttons?: {
    icon: React.ReactNode | undefined
    label: string
    onClick: () => void
  }[]
}

export default function SearchBar({ search, onSearchChange, buttons }: SearchBarProps) {
  return (
    <SearchBarLayout
      contents={[
        <SwitchCluster key={"switch-cluster"} />,
        <SearchText key={"search"} search={search} onSearchChange={onSearchChange} />,
      ]}
      buttons={buttons}
    />
  )
}

export type SearchBarLayoutProps = {
  contents?: React.ReactNode[]
  buttons?: {
    icon?: React.ReactNode
    label: string
    onClick: () => void
  }[]
}

export function SearchBarLayout(props: SearchBarLayoutProps) {
  const { contents, buttons } = props
  return (
    <Paper elevation={0}>
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={0}
      >
        {contents && contents.map((content, index) => {
          return (
            <Fragment key={index}>
              {content}
              <Spacer size={16} />
            </Fragment>)
        })}

        <Typography flexGrow={1} />

        {buttons && buttons.map((button, index) => {
          return <Fragment key={index}>
            <Spacer size={16} />
            <Button
              variant="outlined"
              startIcon={button.icon}
              style={{
                height: '40px',
                lineHeight: '40px',
                textTransform: 'none',
                border: borderValue,
                color: primaryColor
              }}
              onClick={button.onClick}
            >
              <TextTypo
                text={button.label}
                color={primaryColor}
                fontSize="14px"
                fontWeight="500"
                lineHeight="16px"
              />
            </Button>
          </Fragment>
        })}
      </Stack>
    </Paper>
  )
}

export function SwitchCluster() {
  const intl = useIntl()
  const { clusters, currentCluster, setCurrentClusterName } = useClusters()

  return (
    <Autocomplete
      options={clusters}
      getOptionLabel={(option) => option.name}
      renderInput={(params) => (
        <TextField
          style={{
            background: '#FFF',
            color: '#646464',
          }}
          {...params}
          label={
            intl.formatMessage({
              id: 'app.cluster',
            })
          }
          size="small"
          variant="outlined"
        />
      )}
      value={currentCluster}
      onChange={(_, value) => {
        setCurrentClusterName(value.name)
      }}
      style={{ width: '300px' }}
      disableClearable
    />
  )
}

export type SelectTextProps = {
  label: string
  value: string | number
  onChange: (value: string | number) => void
  options: {
    label: string
    value: string | number
  }[]
}

export function SelectText(props: SelectTextProps) {
  const { label, value, onChange, options } = props

  return (
    <TextField
      style={{
        flex: 1,
        height: '40px',
        background: '#fff',
        width: '100%',
        maxWidth: '250px',
        minWidth: '200px',
      }}
      select
      size="small"
      label={label}
      value={value}
      onChange={(event) => { onChange(event.target.value) }}
      variant="outlined"
    >
      {options.map((o, index) => {
        return <MenuItem key={index} value={o.value}>{o.label}</MenuItem>
      })}
    </TextField>
  )
}

export type SearchTextProps = {
  search: string
  onSearchChange: (search: string) => void
}

export function SearchText(props: SearchTextProps) {
  const intl = useIntl()
  const { search, onSearchChange } = props

  return (
    <TextField
      style={{
        flex: 1,
        height: '40px',
        background: '#fff',
        width: '100%',
        maxWidth: '400px',
        minWidth: '300px',
      }}
      variant="outlined"
      size="small"
      value={search}
      onChange={(event) => {
        onSearchChange(event.target.value)
      }}
      label={intl.formatMessage({
        id: 'app.general.name',
      })}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon
              onClick={(event) => {
                event.preventDefault();
              }}
            />
          </InputAdornment>
        ),
        endAdornment: search ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              edge="end"
              onClick={() => { onSearchChange('') }}
            >
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  )
}