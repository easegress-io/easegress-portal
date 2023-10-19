import TextTypo from "@/components/TextTypo";
import { Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

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
        border: "1px solid #EAEBEE",
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
        borderTop: "1px solid #EAEBEE",
        borderBottom: "none",
        ...style
      }}
      {...other}
    >
      {children}
    </TableCell>
  )
}