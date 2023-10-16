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