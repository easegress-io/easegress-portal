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

import yaml from "js-yaml"

export function isNullOrUndefined(obj: any): boolean {
  return obj === null || obj === undefined;
}

export function catchErrorMessage(err: any): string {
  if (err.response) {
    return JSON.stringify(err.response.data)
  }
  if (err.message) {
    return JSON.stringify(err.message)
  }
  return JSON.stringify(err)
}

export function truncateString(str: string, maxLength: number): string {
  if (str.length > maxLength) {
    return str.slice(0, maxLength) + "..."
  }
  return str
}

export function loadYaml(yamlStr: string): { result: any, err: string } {
  let result = {} as any
  try {
    result = yaml.load(yamlStr)
  } catch (e) {
    return {
      result: {},
      err: JSON.stringify(e)
    }
  }
  if (isNullOrUndefined(result)) {
    return {
      result: {},
      err: "null or undefined"
    }
  }
  return {
    result,
    err: ""
  }
}