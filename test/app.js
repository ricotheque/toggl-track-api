import { TogglTrackClient } from '../src/TogglTrackClient'

main()

async function main () {
  const client = new TogglTrackClient({
    apiToken: '[token]',
    messageCallback: update
  })

  const data = await client.request('/me')
  console.log(data)
}

async function update (message, source) {
  console.log(source)

  document.querySelector('#status').innerText = message
}
