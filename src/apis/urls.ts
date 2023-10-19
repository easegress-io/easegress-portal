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
