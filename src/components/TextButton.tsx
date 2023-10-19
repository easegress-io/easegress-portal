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

import { primaryColor } from "@/app/style"
import { Button, ButtonBase } from "@mui/material"

export type TextButtonProps = {
  title: string
  onClick: () => void
  color?: string
  other?: {
    [key: string]: any
  }
}

export default function TextButton(props: TextButtonProps) {
  const { title, onClick, other, color = 'primary' } = props
  return (
    <Button
      sx={{
        minWidth: 0,
        padding: 0,
        '&:hover': {
          backgroundColor: 'transparent',
        },
        textTransform: 'none',
        color: color === 'primary' ? primaryColor : undefined,
      }}
      color={color === "primary" ? undefined : color as any}
      onClick={onClick}
      {...other}
    >
      {title}
    </Button>
  )
}