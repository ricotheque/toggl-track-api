import { Buffer } from 'buffer'
import { sleep } from './utils'

const fetch = require('fetch-retry')(global.fetch)

export class TogglTrackClient {
  constructor (options = {}) {
    this.config = {
      // apiToken: '1234',
      // organizationId: '1234',
      // workspaceId: '1234,

      server: 'https://api.track.toggl.com',
      delayBetweenRequests: 1000,

      messageCallback: () => {},
      retries: 3,

      // Exponential-backoff default
      retryDelay: function (attempt, error, response) {
        return Math.pow(2, attempt) * 1000 // 1000, 2000, 4000
      },

      // Retry on these HTTP status codes
      retryOn: [500, 502, 503, 504]
    }

    this.updateConfig(options)
  }

  async updateConfig (newOptions) {
    this.config = { ...this.config, ...newOptions }
  }

  async request (endpoint, options = {}) {
    await sleep(this.config.delayBetweenRequests)

    try {
      if (typeof endpoint !== 'string' || endpoint.trim() === '') {
        throw new Error('Invalid endpoint: must be a non-empty string.')
      }

      if (
        endpoint.includes('{{workspace_id}}') &&
        /^\d+$/.test(this.config.workspaceId) !== true
      ) {
        throw new Error(
          'Invalid workspaceId: must be a non-empty string containing only digits.'
        )
      }

      if (
        endpoint.includes('{{organization_id}}') &&
        /^\d+$/.test(this.config.organizationId) !== true
      ) {
        throw new Error(
          'Invalid organizationId: must be a non-empty string containing only digits.'
        )
      }

      endpoint = endpoint.replaceAll(
        '{{workspace_id}}',
        this.config.workspaceId
      )
      endpoint = endpoint.replaceAll(
        '{{organization_id}}',
        this.config.organizationId
      )

      endpoint = this.config.server + endpoint

      const credentials = Buffer.from(
        `${this.config.apiToken}:api_token`
      ).toString('base64')

      const fetchOptions = {
        ...options,
        headers: {
          Authorization: `Basic ${credentials}`,
          // 'Content-Type': 'application/json',
          ...options.headers
        },
        retries: this.config.retries,
        retryDelay: this.config.retryDelay,
        retryOn: this.config.retryOn
      }

      const response = await fetch(endpoint, fetchOptions)

      if (response.ok === false) {
        if (response.status === 403) {
          const authErrorMessage = 'Auth error'
          throw new Error(authErrorMessage)
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }

      let data

      if (typeof options.responseType === 'undefined') {
        data = await response.json()
      } else if (options.responseType === 'json') {
        data = await response.json()
      } else if (options.responseType === 'text') {
        data = await response.text()
      }
      return data
    } catch (error) {
      await this.emitMessage(
        `Request failed: ${error.message}`,
        'TogglTrackClient.request()'
      )
      throw error
    }
  }

  async emitMessage (message, source) {
    if (
      this.config.messageCallback &&
      typeof this.config.messageCallback === 'function'
    ) {
      await this.config.messageCallback(message, source)
    }
  }
}
