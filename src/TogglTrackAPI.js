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

    console.log(options)

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
        `TogglTrackAPI.restRequest(): Invalid method "${method}" specified`
      )
    }
    if (sourceFunctionName === '') {
      throw new TogglError(
        'TogglTrackAPI.restRequest(): Please specify a sourceFunctionName'
      )
    }

    // Return cached data if it exists
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
    if (this.cache.has(sourceFunctionName, cacheKey)) {
      return this.cache.get(sourceFunctionName, cacheKey)
    }

    // Delay requests to minimize 429 errors
    await sleep(this.waitInMilliseconds)

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

    while (retries < this.maxRetries) {
      try {
        const response = await fetch(requestUrl, options)

        if (!response.ok) {
          if (
            this.retryCodes.includes(response.status) &&
            retries < this.maxRetries
          ) {
            retries++
            await sleep(this.retryDelayInMilliseconds)
            continue
          }

          const errorDetails = await response.text()
          const errorMessage = `
                        HTTP error for ${response.url}\n
                        ${response.status} - ${response.statusText}\n
                        ${errorDetails}
                    `
          return new TogglError(errorMessage)
        }

        let responseData
        if (responseType === 'json') {
          responseData = await response.json()
        } else {
          responseData = await response.text()
        }

        this.cache.set(sourceFunctionName, cacheKey, responseData)
        return responseData
      } catch (error) {
        if (!(error instanceof TogglError) || retries === this.maxRetries - 1) {
          return new TogglError(error.message)
        }
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
}
