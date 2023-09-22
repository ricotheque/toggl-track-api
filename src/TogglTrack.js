import { TogglTrackUsers } from './TogglTrackUsers'
import { TogglTrackProjects } from './TogglTrackProjects'
import { TogglEmitter } from './TogglEmitter'
import { TogglTrackClients } from './TogglTrackClients'

export class TogglTrack {
  constructor (options) {
    this.clients = new TogglTrackClients(options)
    this.projects = new TogglTrackProjects(options, this.clients)
    this.users = new TogglTrackUsers(options)
    this.cache = options.cache
  }

  registerListeners (callback) {
    for (const key in this) {
      if (this[key] instanceof TogglEmitter) {
        this[key].on('*', callback)
      }
    }
  }
}
