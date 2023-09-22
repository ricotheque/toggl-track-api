import { TogglTrackAPI } from './TogglTrackAPI'
import { objectToQueryString } from './utils'

export class TogglTrackUsers extends TogglTrackAPI {
  async getCurrent () {
    return this.restRequest(
      'GET',
      '/api/v9/me',
      null,
      'json',
      'TogglTrackUsers.getCurrent()'
    )
  }

  async getCurrentPreferences () {
    return this.restRequest(
      'GET',
      '/api/v9/me/preferences',
      null,
      'json',
      'TogglTrackUsers.getCurrentPreferences()'
    )
  }

  async getCurrentPreferencesWeb () {
    return this.restRequest(
      'GET',
      '/api/v9/me/preferences/web',
      null,
      'json',
      'TogglTrackUsers.getCurrentPreferencesWeb()'
    )
  }

  async getForOrganization (options = {}) {
    let page = 1
    let organizationUsers = []

    while (true) {
      Object.assign(options, {
        page,
        per_page: 500
      })

      const queryString = objectToQueryString(options)

      const nextOrganizationUsers = await this.restRequest(
        'GET',
        '/api/v9/organizations/{{organization_id}}/users?' + queryString,
        null,
        'json',
        'TogglTrackUsers.getForOrganization()'
      )

      if (
        nextOrganizationUsers &&
        Array.isArray(nextOrganizationUsers) &&
        nextOrganizationUsers.length > 0
      ) {
        organizationUsers = organizationUsers.concat(nextOrganizationUsers)
      } else {
        break
      }

      this.emit(
        'TogglTrackUsers.getForOrganization()',
        `Retrieved organization users page ${page}`
      )

      page++

      if (page >= 1000) {
        // No way a organization will ever have more than 2M users
        console.warn('Maximum iterations reached.')
        break
      }
    }

    return organizationUsers
  }
}
