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

import React from 'react';
import mermaid from 'mermaid'
import { pipeline } from '@/apis/object';
import _ from 'lodash';
import { Box } from '@mui/material';

export type FlowChartProps = {
  idPrefix?: string
  pipeline: pipeline.Pipeline | undefined
}

// ChartNode is a node in the flow chart.
// node in flow can have same name, so we use "id" to distinguish them.
// "name" also should contains namespace if it has.
export type ChartNode = {
  node: pipeline.FlowNode
  index: number
  id: string
  name: string
}

export default function FlowChart({ idPrefix, pipeline }: FlowChartProps) {
  const [chart, setChart] = React.useState('')

  React.useEffect(() => {
    if (!pipeline) {
      setChart('')
      return
    }

    let flow = pipeline.flow || []
    if (flow.length === 0) {
      flow = pipeline.filters?.map((f, index) => {
        return {
          filter: f?.name || `typing-filter-${index}...`,
          alias: "",
          jumpIf: {},
          namespace: "",
        }
      })
    }

    let usedIds = new Map<string, number>()
    // getIDName returns id and name for a flow item.
    const getIDName = (flowItem: pipeline.FlowNode, index: number) => {
      let name = flowItem?.alias || flowItem?.filter || `typing-filter-${index}...`
      if (name === "END") {
        return {
          id: name,
          name,
        }
      }

      // to make sure jumpIf works. id should be same of name only if it is duplicated.
      let id = name
      if (usedIds.has(id)) {
        let count = usedIds.get(name) || 0
        count++
        usedIds.set(name, count)
        id = `${name}-${count}`
      } else {
        usedIds.set(name, 1)
      }

      if (flowItem?.namespace) {
        return {
          id: id,
          name: `${flowItem.namespace}/${name}`
        }
      }
      return {
        id: id,
        name: name
      }
    }

    let chartFlow = flow.map((flowItem, index) => {
      let res: ChartNode = {
        node: flowItem,
        index: index,
        ...getIDName(flowItem, index)
      }
      return res
    })

    let lastIsEnd = false
    let mermaidText = 'graph TB;\nSTART((START))';
    chartFlow && chartFlow.length && chartFlow.forEach(
      (item) => {
        if (item.name === "END" && !lastIsEnd) {
          lastIsEnd = true
          mermaidText += '==>END((END));\n';
          return
        }
        const name = `${item.id}(${item.name})`
        if (lastIsEnd) {
          mermaidText += `${name}`
          lastIsEnd = false
        } else {
          mermaidText += `==>${name}`
        }
      }
    );
    if (!lastIsEnd) {
      mermaidText += '==>END((END));\n';
    }

    chartFlow && chartFlow.length && chartFlow
      .filter((chartNode) => !_.isEmpty(chartNode?.node?.jumpIf))
      .forEach((chartNode) => {
        let flowItem = chartNode.node;
        Object.keys(flowItem.jumpIf).forEach((jumpIfKey) => {
          let jumpIfValue = flowItem?.jumpIf?.[jumpIfKey];
          if (!_.isEmpty(jumpIfKey)) {
            mermaidText += `${chartNode.id}-.->|${jumpIfKey}|${jumpIfValue};\n`;
          } else {
            mermaidText += `${chartNode.id}-.->${jumpIfValue};\n`;
          }
        });
      });
    setChart(mermaidText);
  }, [pipeline, setChart]);

  return (
    <MermaidChart id={(idPrefix || "") + pipeline?.name} chart={chart} />
  );
};

mermaid.initialize({
  startOnLoad: false,
})

export type MermaidChartProps = {
  id?: string
  chart: string
}

function MermaidChart({ id, chart }: MermaidChartProps) {
  const chartRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!chartRef.current) {
      return
    }
    if (chart === "") {
      chartRef.current.innerHTML = ""
      return
    }

    mermaid.render(
      id || 'mermaidChart',
      chart,
    ).then((result) => {
      chartRef.current!.innerHTML = result.svg;
    })

  }, [id, chart]);

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      minWidth: "350px",
    }}>
      <div
        ref={chartRef}
      />
    </Box >
  )
};