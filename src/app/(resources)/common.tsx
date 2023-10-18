import TextTypo from "@/components/TextTypo";
import { TableCell } from "@mui/material";

export type TableHeadCellProps = {
  text: string
  style?: React.CSSProperties
}

export function TableHeadCell({ text, style }: TableHeadCellProps) {
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