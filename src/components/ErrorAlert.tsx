"use client"

import { catchHTTPErrorMessage, truncateString } from "@/common/utils"
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"
import { Alert, IconButton } from "@mui/material"

export default function ErrorAlert({ error, expand, onClose }: {
  error: any,
  expand: boolean,
  onClose: () => void
}) {
  return (
    <Alert
      severity="error"
      style={{
        margin: '21px 0 0 0',
        display: 'flex',
      }}
      action={expand ?
        <IconButton onClick={onClose}><ExpandLess /></IconButton> :
        <IconButton onClick={onClose}><ExpandMore /></IconButton>
      }
    >
      {truncateString(catchHTTPErrorMessage(error), 100)}
      {expand && <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(error, null, 2)}</pre>}
    </Alert>
  )
}