import { TogglTrackClients } from '../src/TogglTrackClients'

window.addEventListener('load', function () {
  document.getElementById('start').addEventListener('click', main)
})

async function main () {
  const clients = new TogglTrackClients({
    apiToken: '[token]',
    workspaceId: '5972963',
    messageCallback: update
  })

  // const data = await clients.getById(64131782)

  let data = await clients.create('Grupo Concal2')
  console.log(data)

  data = await clients.rename('Grupo Concal2', 'Grupo Concal3')
  console.log(data)

  data = await clients.archive('Grupo Concal3')
  console.log(data)

  data = await clients.restore('Grupo Concal3')
  console.log(data)

  data = await clients.delete('Grupo Concal3')
  console.log(data)
}

async function update (message, source) {
  document.querySelector('#status').innerText = `${message} from ${source}`
}
