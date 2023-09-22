import { TogglTrackAPI } from './TogglTrackAPI'
import { objectToQueryString } from './utils'

export class TogglTrackClients extends TogglTrackAPI {
  async getAll (options = {}) {
    const queryString = objectToQueryString(options)

    const clients = await this.restRequest(
      'GET',
      '/api/v9/workspaces/{{workspace_id}}/clients?' + queryString,
      null,
      'json',
      'TogglTrackClients.getAll()'
    )

    return clients
  }

  async getByName (clientName) {
    const clients = await this.getAll({ status: 'both' })

    for (const client of clients) {
      if (client.name === clientName) {
        return client
      }
    }

    this.emit(
      'TogglTrackProjects.getById()',
      `Couldn't find client "${clientName}"`
    )
    return false
  }

  async getById (clientId) {
    const clients = await this.getAll({ status: 'both' })

    for (const client of clients) {
      if (client.id === clientId) {
        return client
      }
    }

    this.emit(
      'TogglTrackProjects.getById()',
      `Couldn't find client id ${clientId}`
    )
    return false
  }
}
