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
  }, [router])

  return (
    <div>
      <Typography>{intl.formatMessage({ id: 'app.redirect' })}</Typography>
    </div>
  )
}
