import { TogglTrackAPI } from './TogglTrackAPI'
import { objectToQueryString } from './utils'

export class TogglTrackTags extends TogglTrackAPI {
  async getAll (options = {}) {
    const queryString = objectToQueryString(options)

    const tags = await this.restRequest(
      'GET',
      '/api/v9/workspaces/{{workspace_id}}/tags?' + queryString,
      null,
      'json',
      'TogglTrackClients.getAll()'
    )

    return tags
  }

  async getByName (name) {
    const tags = await this.getAll()

    for (const tag of tags) {
      if (tag.name === name) {
        return tag
      }
    }

    return false
  }

  async create (name) {
    const result = await this.restRequest(
      'POST',
      '/api/v9/workspaces/{{workspace_id}}/tags',
      { name },
      'json',
      'TogglTrackTags.create()'
    )

    this.emit('TogglTrackTags.create()', `Creating tag ${name}`)

    return result
  }

  async delete (name) {
    const tag = await this.getByName(name)

    if (tag === false) {
      return false
    }

    const result = await this.restRequest(
      'PATCH',
      '/api/v9/workspaces/5972963/tags',
      { delete: [tag.id] },
      'text',
      'TogglTrackTags.delete()'
    )

    this.emit('TogglTrackTags.delete()', `Deleting tag ${name}`)

    return result
  }

  async rename (oldTagName, newTagName) {
    const tag = await this.getByName(oldTagName)

    if (tag === false || typeof tag.id === 'undefined') {
      return false
    }

    const result = await this.restRequest(
      'PUT',
      `/api/v9/workspaces/{{workspace_id}}/tags/${tag.id}`,
      { name: newTagName },
      'json',
      'TogglTrackTags.rename()'
    )

    this.emit(
      'TogglTrackTags.rename()',
      `Renaming tag ${oldTagName} to ${newTagName}`
    )

    return result
  }
}
