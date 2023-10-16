export namespace urls {
    const apiURL = "/apis/v2"

    export const Members = apiURL + "/status/members"
    export const MemberItem = (id: string) => apiURL + `/status/members/${id}`

    export const Objects = apiURL + "/objects"
    export const ObjectItem = (id: string) => apiURL + `/objects/${id}`

    export const StatusObjectsURL = apiURL + "/status/objects"
    export const StatusObjectItemURL = (id: string) => apiURL + `/status/objects/${id}`

    export const Logs = (tail: number, follow: boolean) => apiURL + `/logs?tail=${tail}&follow=${follow}`
}
