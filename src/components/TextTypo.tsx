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
import { Typography } from "@mui/material"

export type TextTypoProps = {
  text: string
  color?: string
  fontFeatureSettings?: string
  fontFamily?: string
  fontSize?: string
  fontStyle?: string
  fontWeight?: string
  lineHeight?: string
}


export default function TextTypo(props: TextTypoProps) {
  const { text, color, fontFeatureSettings, fontSize, fontFamily, fontStyle, fontWeight, lineHeight } = props
  return (
    <Typography
      sx={{
        color: color || primaryColor,
        fontFeatureSettings: fontFeatureSettings || "'clig' off, 'liga' off",
        fontFamily: fontFamily || "Outfit",
        fontSize: fontSize || "14px",
        fontStyle: fontStyle || "normal",
        fontWeight: fontWeight || "400",
        lineHeight: lineHeight || "18px",
      }}
    >
      {text}
    </Typography>
  )
}