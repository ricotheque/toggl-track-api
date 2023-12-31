import { TogglTrackClient } from './TogglTrackClient'
import { TogglTrackClients } from './TogglTrackClients'
import { objectToQueryString } from './utils'

export class TogglTrackProjects extends TogglTrackClient {
  constructor (options) {
    super(options)

    if (this.config.clients instanceof TogglTrackClients === false) {
      throw new Error(
        'You need to pass an instance of TogglTrackClients when creating a new instance of TogglTrackProjects.'
      )
    }
  }

  // async getAll (options = {}) {
  //   let nextPage = 1
  //   let allProjects = []

  //   while (true) {
  //     options.page = nextPage

  //     const queryString = objectToQueryString(options)

  //     const nextProjects = await this.restRequest(
  //       'GET',
  //       '/api/v9/workspaces/{{workspace_id}}/projects?' + queryString,
  //       null,
  //       'json',
  //       'TogglTrackProjects.getAll()'
  //     )

  //     if (
  //       nextProjects &&
  //       Array.isArray(nextProjects) &&
  //       nextProjects.length > 0
  //     ) {
  //       allProjects = allProjects.concat(nextProjects)
  //     } else {
  //       break
  //     }

  //     this.emit(
  //       'TogglTrackProjects.getAll()',
  //       `Retrieved project page ${nextPage}`
  //     )

  //     nextPage++

  //     if (nextPage >= 1000) {
  //       // No way a workspace will ever have more than 151K projects
  //       console.warn('Maximum pages reached.')
  //       break
  //     }
  //   }

  //   return allProjects
  // }

  async getAllQuickly (options = {}) {
    let nextProjectId = 0
    let iterations = 0

    let allProjects = []

    while (true) {
      const fetchOptions = {
        ...options,
        start: nextProjectId,
        page_size: 200
      }

      const nextProjects = await this.request(
        '/reports/api/v3/workspace/{{workspace_id}}/filters/projects',
        {
          method: 'POST',
          body: JSON.stringify(fetchOptions)
        }
      )

      if (
        nextProjects &&
        Array.isArray(nextProjects) &&
        nextProjects.length > 0
      ) {
        const lastProject = nextProjects[nextProjects.length - 1]
        if (lastProject && typeof lastProject.id !== 'undefined') {
          nextProjectId = lastProject.id + 1
          allProjects = allProjects.concat(nextProjects)
        } else {
          break
        }
      } else {
        break
      }

      iterations++

      this.emitMessage(
        `Quickly retrieved project page ${iterations}`,
        'TogglTrackProjects.getAllQuickly()'
      )

      if (iterations >= 1000) {
        // No way a workspace will ever have more than 2M projects
        console.warn('Maximum iterations reached.')
        break
      }
    }

    return allProjects
  }

  async getByName (projectName, clientName = '') {
    const projects = await this.getAllQuickly()

    for (const project of projects) {
      if (project.name === projectName) {
        if (clientName !== '' && clientName != null) {
          const clientId = project.client_id
          const foundClient = await this.clients.getByName(clientName)

          if (foundClient !== false && foundClient.id === clientId) {
            return project
          }
        } else {
          if (project.client_id === null) {
            return project
          }
        }
      }
    }

    this.emit(
      'TogglTrackProjects.getByName()',
      `Couldn't find project "${projectName}" (with client "${clientName}")`
    )
    return false
  }
}
