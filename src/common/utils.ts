import yaml from "js-yaml"

export function isNullOrUndefined(obj: any): boolean {
  return obj === null || obj === undefined;
}

export function catchHTTPErrorMessage(err: any): string {
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