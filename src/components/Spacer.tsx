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