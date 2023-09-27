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

  async create (newClientName) {
    const newClient = await this.restRequest(
      'POST',
      '/api/v9/workspaces/{{workspace_id}}/clients',
      {
        name: newClientName,
        wid: parseInt(this.workspaceId)
      },
      'json',
      'TogglTrackClients.create()'
    )

    return newClient
  }

  async delete (nameOfClientToDelete) {
    const clientToDelete = await this.getByName(nameOfClientToDelete)

    if (clientToDelete === false || typeof clientToDelete.id === 'undefined') {
      return false
    }

    const deleteClient = await this.restRequest(
      'DELETE',
      '/api/v9/workspaces/{{workspace_id}}/clients/' + clientToDelete.id,
      null,
      'text',
      'TogglTrackClients.delete()'
    )

    return deleteClient
  }

  async rename (nameOfClientToRename, newClientName) {
    const clientToRename = await this.getByName(nameOfClientToRename)

    if (clientToRename === false || typeof clientToRename.id === 'undefined') {
      return false
    }

    const renameClient = await this.restRequest(
      'PUT',
      `/api/v9/workspaces/{{workspace_id}}/clients/${clientToRename.id}`,
      {
        name: newClientName,
        wid: parseInt(this.workspaceId)
      },
      'json',
      'TogglTrackClients.rename()'
    )

    return renameClient
  }

  async archive (nameOfClientToArchive) {
    const clientToArchive = await this.getByName(nameOfClientToArchive)

    if (
      clientToArchive === false ||
      typeof clientToArchive.id === 'undefined'
    ) {
      return false
    }

    const archiveClient = await this.restRequest(
      'POST',
      `/api/v9/workspaces/{{workspace_id}}/clients/${clientToArchive.id}/archive`,
      null,
      'json',
      'TogglTrackClients.archive()'
    )

    return archiveClient
  }

  async restore (nameOfClientToRestore, restoreAllProjects = true) {
    const clientToRestore = await this.getByName(nameOfClientToRestore)

    if (
      clientToRestore === false ||
      typeof clientToRestore.id === 'undefined'
    ) {
      return false
    }

    const restoreClient = await this.restRequest(
      'POST',
      `/api/v9/workspaces/{{workspace_id}}/clients/${clientToRestore.id}/restore`,
      { restore_all_projects: restoreAllProjects },
      'json',
      'TogglTrackClients.archive()'
    )

    return restoreClient
  }
}
