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

"use client"

import { catchErrorMessage, truncateString } from "@/common/utils"
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
      {truncateString(catchErrorMessage(error), 100)}
      {expand && <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(error, null, 2)}</pre>}
    </Alert>
  )
}