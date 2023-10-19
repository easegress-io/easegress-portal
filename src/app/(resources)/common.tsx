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

import TextTypo from "@/components/TextTypo";
import { Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { borderValue, primaryColor } from "../style";

type ResourceTableProps = {
  headers: {
    text: string
    style?: React.CSSProperties
  }[]
  children: React.ReactNode
}

export function ResourceTable(props: ResourceTableProps) {
  const { headers, children } = props

  return (
    <Paper elevation={0}
      sx={{
        width: '100%',
        overflow: 'hidden',
        border: borderValue,
        boxShadow: "none",
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {headers.map((h, index) => {
              return <TableHeadCell key={index} text={h.text} style={h.style} />
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {children}
        </TableBody>
      </Table>
    </Paper >
  )
}

type TableHeadCellProps = {
  text: string
  style?: React.CSSProperties
}

function TableHeadCell({ text, style }: TableHeadCellProps) {
  return (
    <TableCell
      style={{
        backgroundColor: "#FAFAFA",
        ...style
      }}
    >
      <TextTypo
        text={text}
        color={"var(--body-1-emphasize, #3B3B3B)"}
        fontSize="14px"
        fontWeight="600"
        lineHeight="18px"
      />
    </TableCell>
  )
}

export type TableBodyCellProps = {
  children: React.ReactNode
  style?: React.CSSProperties
  other?: {
    [key: string]: any
  }
}

export function TableBodyCell(props: TableBodyCellProps) {
  const { children, style, other } = props
  return (
    <TableCell
      style={{
        borderTop: borderValue,
        borderBottom: "none",
        ...style
      }}
      {...other}
    >
      {children}
    </TableCell>
  )
}

export type TableBodyRowProps = {
  children: React.ReactNode
  highlight?: boolean
  style?: React.CSSProperties
  other?: {
    [key: string]: any
  }
}

export function TableBodyRow(props: TableBodyRowProps) {
  const { children, style, other } = props
  return (
    <TableRow
      hover
      role="checkbox"
      style={{
        backgroundColor: props.highlight ? "#DCEEFB" : undefined,
        transition: 'background-color 3s',
        ...style
      }}
      {...other}
    >
      {children}
    </TableRow>
  )
}