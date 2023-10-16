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