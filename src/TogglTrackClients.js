import { TogglTrackClient } from './TogglTrackClient'
import { objectToQueryString } from './utils'

export class TogglTrackClients extends TogglTrackClient {
  async getAll (options = {}) {
    const queryString = objectToQueryString(options)

    const clients = await this.request(
      '/workspaces/{{workspace_id}}/clients?' + queryString
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

    return false
  }

  async getById (clientId) {
    const clients = await this.getAll({ status: 'both' })

    for (const client of clients) {
      if (client.id === clientId) {
        return client
      }
    }
    return false
  }

  async create (newClientName) {
    this.emitMessage(
      `Creating client "${newClientName}"...`,
      'TogglTrackClients.create()'
    )

    const newClient = await this.request(
      '/workspaces/{{workspace_id}}/clients',
      {
        method: 'POST',
        body: JSON.stringify({
          name: newClientName,
          wid: parseInt(this.config.workspaceId)
        })
      }
    )

    return newClient
  }

  async delete (nameOfClientToDelete) {
    const clientToDelete = await this.getByName(nameOfClientToDelete)

    if (clientToDelete === false || typeof clientToDelete.id === 'undefined') {
      return false
    }

    this.emitMessage(
      `Deleting client "${nameOfClientToDelete}"...`,
      'TogglTrackClients.delete()'
    )
    const deleteClient = await this.request(
      '/workspaces/{{workspace_id}}/clients/' + clientToDelete.id,
      {
        method: 'DELETE',
        responseType: ''
      }
    )

    return deleteClient
  }

  async rename (nameOfClientToRename, newClientName) {
    const clientToRename = await this.getByName(nameOfClientToRename)

    if (clientToRename === false || typeof clientToRename.id === 'undefined') {
      return false
    }

    this.emitMessage(
      `Renaming client "${nameOfClientToRename}" to "${newClientName}"...`,
      'TogglTrackClients.rename()'
    )
    const renameClient = await this.request(
      `/workspaces/{{workspace_id}}/clients/${clientToRename.id}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          name: newClientName,
          wid: parseInt(this.config.workspaceId)
        })
      }
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
    this.emitMessage(
      `Archiving client "${nameOfClientToArchive}"...`,
      'TogglTrackClients.archive()'
    )

    const archiveClient = await this.request(
      `/workspaces/{{workspace_id}}/clients/${clientToArchive.id}/archive`,
      { method: 'POST' }
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

    this.emitMessage(
      `Restoring client "${nameOfClientToRestore}"...`,
      'TogglTrackClients.restore()'
    )

    const restoreClient = await this.request(
      `/workspaces/{{workspace_id}}/clients/${clientToRestore.id}/restore`,
      {
        method: 'POST',
        body: JSON.stringify({ restore_all_projects: restoreAllProjects })
      }
    )

    return restoreClient
  }
}
