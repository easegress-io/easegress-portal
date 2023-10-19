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

import { Editor } from "@monaco-editor/react"
import Close from "@mui/icons-material/Close"
import { Box, Drawer, IconButton, Stack, Toolbar, Typography } from "@mui/material"
import { useIntl } from "react-intl"

export type YamlViewerProps = {
  title?: string
  open: boolean
  onClose: () => void
  yaml: string
}

export default function YamlViewer(props: YamlViewerProps) {
  const intl = useIntl()
  const { open, onClose, yaml, title } = props
  const options = {
    scrollBeyondLastLine: false,
    fontSize: 14,
    readOnly: true,
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: '100%',
          '@media (min-width: 1000px)': {
            width: '50%',
          },
        },
      }}>
      <Toolbar />
      <Stack
        margin={1}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Typography variant='h6'>{title ? title : intl.formatMessage({ id: "app.general.actions.view" })}</Typography>
        <Typography flexGrow={1} />
        <IconButton
          onClick={onClose}
        >
          <Close />
        </IconButton>
      </Stack>

      <Box>
        <Editor language="yaml" value={yaml} height={'80vh'} onChange={() => { }}
          options={options} />
      </Box>
    </Drawer >
  )
}