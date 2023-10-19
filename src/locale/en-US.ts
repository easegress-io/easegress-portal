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

export const enUS = {
  'app.redirect': 'Redirecting...',

  'app.cluster': 'Cluster',
  'app.cluster.apiAddress': 'API Address',
  'app.cluster.role': "Role",
  'app.cluster.start': "Start",
  'app.cluster.heartbeat': "Heartbeat",
  'app.cluster.manage': "Manage Clusters",
  'app.cluster.save': "Save",
  'app.cluster.invalidRCFile': "Invalid egctlrc file, error: {error}",

  'app.log': 'Log',
  'app.log.limit': 'Log Limit',
  'app.log.getLogFailed': "Get logs failed, error: {error}",
  'app.log.getLogSuccess': "Get logs success",
  'app.log.refresh': "Refresh",

  'app.controller': 'Controller',

  'app.pipeline': 'Pipeline',
  'app.pipeline.filter': 'Filter',
  'app.pipeline.flow': 'Flow',
  'app.pipeline.tags': 'Tags',
  'app.pipeline.usedBy': 'Used By',
  'app.pipeline.jumpIf': 'JumpIf',
  'app.pipeline.resilience': 'Resilience',
  'app.pipeline.alias': 'Alias',

  'app.traffic': 'Traffic',
  'app.traffic.createServer': 'Create Server',
  'app.traffic.host': 'Host',
  'app.traffic.port': 'Port',
  'app.traffic.path': 'Path',
  'app.traffic.ipFilter': 'IP Filter',
  'app.traffic.headers': 'Headers',
  'app.traffic.routes': "Routes",
  'app.traffic.method': 'Method',
  'app.traffic.methods': 'Methods',
  'app.traffic.pipeline': 'Pipeline',
  'app.traffic.host.sameAsAbove': "same as above",

  'app.general.name': 'Name',
  'app.general.kind': 'Kind',
  'app.general.invalidYaml': 'Invalid yaml, error: {error}',
  'app.general.invalidKind': 'Invalid kind, only support: {kinds}',
  'app.general.noResult': 'No result found.',
  'app.general.actions': 'Actions',
  'app.general.actions.create': 'Create Resource',
  'app.general.actions.edit': 'Edit',
  'app.general.actions.delete': 'Delete',
  'app.general.actions.yaml': 'YAML',
  'app.general.actions.status': 'Status',
  'app.general.actions.view': 'View',
  'app.general.github': "GitHub repository",
  'app.general.megaease': "Megaease website",

  'app.general.page': 'Page',
  'app.general.pageSize': 'Page Size',
  'app.general.pageJump': 'Jump',
  'app.general.notification': 'Notification',
  'app.general.confirm': "Confirm",
  'app.general.cancel': "Cancel",

  'app.general.create': 'Create Resource',
  'app.general.createSuccess': 'Create {kind} {name} success',
  'app.general.createFailed': 'Create {kind} {name} failed, error: {error}',

  'app.general.getStatusFailed': 'Get status of {kind} {name} failed, error: {error}',

  'app.general.deleteConfirm': "Are you sure to delete this?",
  'app.general.deleteSuccess': 'Delete {kind} {name} success',
  'app.general.deleteFailed': 'Delete {kind} {name} failed, error: {error}',

  'app.general.editSuccess': 'Edit {kind} {name} success',
  'app.general.editFailed': 'Edit {kind} {name} failed, error: {error}',
  'app.general.editChangeNameOrKind': 'Change name or kind is not allowed.',
}