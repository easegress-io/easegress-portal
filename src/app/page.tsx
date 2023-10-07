"use client"

import { Typography } from "@mui/material"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useIntl } from "react-intl"

export default function Home() {
  const router = useRouter()
  const intl = useIntl()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/cluster")
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      <Typography>{intl.formatMessage({ id: 'app.redirect' })}</Typography>
    </div>
  )
}
