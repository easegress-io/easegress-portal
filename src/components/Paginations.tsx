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

import { Box, Button, MenuItem, Pagination, Stack, TextField } from "@mui/material"
import React from "react"
import { useIntl } from "react-intl"

export type PaginationsProps = {
  pageCount: number
  page: number
  onPageChange: (page: number) => void
  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
}

export default function Paginations(props: PaginationsProps) {
  const intl = useIntl()
  const { page, onPageChange, pageCount, pageSize, pageSizeOptions, onPageSizeChange } = props
  const [pageInput, setPageInput] = React.useState(page)

  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={5}
    >
      <Pagination page={page} onChange={(e, v) => { onPageChange(v) }} count={pageCount} />
      <Box>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={1}
        >
          <TextField
            sx={{ width: '100px' }}
            type="number"
            size="small"
            value={pageInput}
            label={intl.formatMessage({ id: "app.general.page" })}
            InputProps={{ inputProps: { min: 1, max: pageCount } }}
            onChange={(e) => {
              const number = parseInt(e.target.value, 10)
              if (number > pageCount || number < 0) {
                return
              }
              setPageInput(parseInt(e.target.value, 10))
            }}
          />
          <Button
            onClick={() => { onPageChange(pageInput) }}
            variant="outlined"
            style={{
              textTransform: 'none',
            }}
          >
            {intl.formatMessage({ id: "app.general.pageJump" })}
          </Button>
        </Stack>
      </Box>
      {pageSize && pageSizeOptions && onPageSizeChange &&
        <TextField
          sx={{ width: '100px' }}
          select
          size="small"
          label={intl.formatMessage({ id: "app.general.pageSize" })}
          value={pageSize}
          onChange={(event) => { onPageSizeChange(parseInt(event.target.value, 10)) }}
        >
          {pageSizeOptions.map((o, index) => {
            return <MenuItem key={index} value={o}>{o}</MenuItem>
          })}
        </TextField>
      }
    </Stack>
  )
}

export function usePagination(length: number, initPageSize: number) {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(initPageSize)
  const pageCount = Math.ceil(length / pageSize)

  React.useEffect(() => {
    setPage(1)
  }, [length, pageSize])

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    pageCount,
  }
}