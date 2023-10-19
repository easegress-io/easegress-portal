import React from 'react';
import mermaid from 'mermaid'
import { pipeline } from '@/apis/object';
import _ from 'lodash';
import { Box } from '@mui/material';

export type FlowChartProps = {
  idPrefix?: string
  pipeline: pipeline.Pipeline | undefined
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
      flow = pipeline.filters?.map(f => {
        return {
          filter: f.name,
          alias: "",
          jumpIf: {},
          namespace: "",
        }
      })
    }

    let mermaidText = 'graph TB;\n';

    mermaidText += 'START((START))';
    flow && flow.length && flow.forEach(
      (flowItem) =>
        (mermaidText += `==>${flowItem?.alias || flowItem.filter}`)
    );
    mermaidText += '==>END((END));\n';

    flow && flow.length && flow
      .filter((flowItem) => !_.isEmpty(flowItem?.jumpIf))
      .forEach((flowItem) => {
        Object.keys(flowItem.jumpIf).forEach((jumpIfKey) => {
          let jumpIfValue = flowItem?.jumpIf?.[jumpIfKey];
          if (!_.isEmpty(jumpIfKey)) {
            mermaidText += `${flowItem?.alias ? flowItem.alias : flowItem.filter}-->|${jumpIfKey}|${jumpIfValue};\n`;
          } else {
            mermaidText += `${flowItem?.alias ? flowItem.alias : flowItem.filter}-->${jumpIfValue};\n`;
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