import { TogglEmitter } from './TogglEmitter'
import { TogglError } from './TogglError'
import { replaceAll, sleep } from './utils'

export class TogglTrackAPI extends TogglEmitter {
  constructor (options) {
    super(options)

    const {
      apiToken,
      workspaceId,
      organizationId,
      waitInMilliseconds,
      maxRetries,
      cache
    } = options

    this.apiToken = apiToken
    this.workspaceId = workspaceId
    this.organizationId = organizationId
    this.waitInMilliseconds =
      waitInMilliseconds < 1000 ? 1000 : waitInMilliseconds
    this.maxRetries = maxRetries || 3
    this.cache = cache

    this.retryDelayInMilliseconds = 10000
    this.retryCodes = [429, 500, 502, 503, 504, 525]
    this.baseUrl = 'https://api.track.toggl.com'
  }

  async restRequest (
    method,
    endpoint,
    data = null,
    responseType = 'json',
    sourceFunctionName = ''
  ) {
    // Assert proper arguments
    if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      throw new TogglError(
        `TogglTrackAPI.restRequest(): Invalid method "${method}" specified`,
        { cause: 'Dev Error' }
      )
    }
    if (sourceFunctionName === '') {
      throw new TogglError(
        'TogglTrackAPI.restRequest(): Please specify a sourceFunctionName',
        { cause: 'Dev Error' }
      )
    }

    const workspaceId = this.workspaceId
    const organizationId = this.organizationId
    const cacheKey = this.cache.makeHash({
      method,
      endpoint,
      data,
      responseType,
      workspaceId,
      organizationId
    })

    if (await this.shouldRequestBeCached(method, endpoint)) {
      if (this.cache.has(sourceFunctionName, cacheKey)) {
        return this.cache.get(sourceFunctionName, cacheKey)
      }
    }

    const headers = new Headers({
      Authorization: 'Basic ' + btoa(this.apiToken + ':api_token')
      // "Content-Type": contentType,
    })

    const options = {
      method,
      headers,
      body: data ? JSON.stringify(data) : null
    }

    const requestUrl = await this.resolveUrl(endpoint)
    let retries = 0

    while (true) {
      await sleep(this.waitInMilliseconds)

      try {
        const response = await fetch(requestUrl, options)

        if (!response.ok) {
          if (
            this.retryCodes.includes(response.status) &&
            retries < this.maxRetries - 1
          ) {
            retries++
            continue
          } else {
            const errorDetails = await response.text()
            let errorMessage, errorCause

            if (retries >= this.maxRetries) {
              errorMessage = `Max attempts reached for ${options.method} ${response.url}: ${response.status} ${errorDetails}`
              errorCause = 'Max attempts reached'
            } else {
              errorMessage = `${options.method} ${response.url}: ${response.status} ${errorDetails}`
              errorCause = response.status
            }

            return new TogglError(errorMessage, { cause: errorCause })
          }
        }

        let responseData
        if (responseType === 'json') {
          responseData = await response.json()
        } else {
          responseData = await response.text()
        }

        if (await this.shouldRequestBeCached(method, endpoint)) {
          this.cache.set(sourceFunctionName, cacheKey, responseData)
        }

        return responseData
      } catch (error) {
        return new TogglError(error.message, { cause: error.cause })
      }
    }
  }

  async resolveUrl (endpoint) {
    let finalEndpoint = replaceAll(
      endpoint,
      '{{workspace_id}}',
      this.workspaceId
    )

    finalEndpoint = replaceAll(
      finalEndpoint,
      '{{organization_id}}',
      this.organizationId
    )

    return this.baseUrl + finalEndpoint
  }

  async shouldRequestBeCached (method, endpoint) {
    if (method === 'GET') {
      return true
    }

    if (
      method === 'POST' &&
      endpoint.includes('/reports/api/v3/workspace/{{workspace_id}}/')
    ) {
      return true
    }

    return false
  }
}
