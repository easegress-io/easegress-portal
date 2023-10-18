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