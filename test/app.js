import { TogglTrackClients } from '../src/TogglTrackClients'
import { TogglTrackProjects } from '../src/TogglTrackProjects'

window.addEventListener('load', function () {
  document.getElementById('start').addEventListener('click', main)
})

async function main () {
  const apiToken = '[token]'
  const workspaceId = '[workspaceId]'

  let result

  // Client tests
  const clients = new TogglTrackClients({
    apiToken,
    workspaceId,
    messageCallback: update
  })

  // result = await clients.create('Test Client 1234ABCD')
  // console.log(result)

  // result = await clients.rename(
  //   'Test Client 1234ABCD',
  //   'Test Client 1234ABCD-2'
  // )
  // console.log(result)

  // result = await clients.archive('Test Client 1234ABCD-2')
  // console.log(result)

  // result = await clients.restore('Test Client 1234ABCD-2')
  // console.log(result)

  // result = await clients.delete('Test Client 1234ABCD-2')
  // console.log(result)

  // Project tests
  const projects = new TogglTrackProjects({
    apiToken,
    workspaceId,
    messageCallback: update,
    clients
  })

  result = await projects.getAllQuickly()
  console.log(result)
}

async function update (message, source) {
  document.querySelector('#status').innerText = `${message} from ${source}`
}
