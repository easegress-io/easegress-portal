import { isNullOrUndefined } from "@/common/utils";

export type SpacerProps = {
  size?: number
  alignRight?: boolean
  style?: any
}

export default function Spacer({ size, alignRight, style }: SpacerProps) {
  if (isNullOrUndefined(size)) {
    size = 8
  }
  if (alignRight) {
    style = style || {}
    style.marginLeft = 'auto'
  }
  return (
    <div
      style={{
        display: 'inline-block',
        width: `${size}px`,
        ...style,
      }}
    />
  );
}