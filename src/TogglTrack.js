import { TogglTrackUsers } from './TogglTrackUsers'
import { TogglTrackProjects } from './TogglTrackProjects'
import { TogglEmitter } from './TogglEmitter'
import { TogglTrackClients } from './TogglTrackClients'
import { TogglTrackTags } from './TogglTrackTags'
import { TogglTrackUserGroups } from './TogglTrackUserGroups'
import { TogglCache } from './TogglCache'

export class TogglTrack {
  constructor (options) {
    const { apiToken, workspaceId, organizationId, waitInMilliseconds } =
      options

    this.apiToken = apiToken
    this.workspaceId = workspaceId
    this.organizationId = organizationId
    this.waitInMilliseconds = waitInMilliseconds

    options.cache = new TogglCache()
    this.cache = options.cache

    this.clients = new TogglTrackClients(options)
    this.projects = new TogglTrackProjects(options, this.clients)
    this.users = new TogglTrackUsers(options)
    this.tags = new TogglTrackTags(options)
    this.userGroups = new TogglTrackUserGroups(options, this.users)
  }

  registerListeners (callback) {
    for (const key in this) {
      if (this[key] instanceof TogglEmitter) {
        this[key].on('*', callback)
      }
    }
  }
}
