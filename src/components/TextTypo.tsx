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