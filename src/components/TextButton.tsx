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
      }}
      color={color as any}
      {...other}
      onClick={onClick}
    >
      {title}
    </Button>
  )
}