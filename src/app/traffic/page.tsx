"use client"

import { useObjects } from "@/apis/hooks"
import { useCurrentCluster } from "../context"
import { Button } from "@mui/base"
import { Editor } from "@monaco-editor/react"
import React from "react"
import { createObject } from "@/apis/object"

export default function Traffic() {
  const { currentCluster } = useCurrentCluster()
  const { objects, error, isLoading, mutate } = useObjects(currentCluster)
  const [objectYaml, setObjectYaml] = React.useState('')

  return (
    <div>
      <div>{JSON.stringify(objects)}</div>
      <Editor
        language="yaml"
        value={objectYaml}
        height={"80vh"}
        onChange={(value) => { setObjectYaml(value!) }}
      />
      <Button onClick={() => { createObject(currentCluster, objectYaml).then(res => { mutate() }) }}>save</Button>
    </div>
  )
}
