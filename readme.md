# Toggl Track API

An (unofficial!) work-in-progress JS client for https://toggl.com/track/.

## Basic setup

```js
const { TogglTrack } = require('../src/TogglTrack')

const toggl = new TogglTrack({
  // Get your api token from track.toggl.com/profile.
  apiToken: '[your_token]',
  organizationId: '1234567',
  workspaceId: '1234567',
  // Caches API output to reduce requests. Required boilerplate.
  cache: new TogglCache()
  // Wait time between API requests. Default is 1000. Can never be lower than 1000.
  waitInMilliseconds: 1000
  // Maximum times API requests are attempted before an error is returned. Default is 3. Can never be lower than 1.
  maxRetries: 3
})

// Use the class emitters to surface progress messages
toggl.registerListeners((eventName, data) => {
  console.log(`${eventName}:`, data)
  document.getElementById('status').textContent = data
})
```

## Sample use

```js
const projects = await toggl.projects.getAllQuickly()
console.log(projects)
```

## Handling cases

Methods that extract data from Toggl Track return `false` if an item wasn't found, or an error instance if there was an error.

```js
const emailToFind = 'example@toggl.com'
const result = await toggl.users.getByEmail(emailToFind)

if (result instanceof TogglTrack.error) {
  console.log(result.message, result.cause)
} else if (result === false) {
  console.log(`${emailToFind} was not found!`)
}
```

## Caching

The package interfaces with the Toggl Track API through `TogglTrackAPI.restRequest()`. This method caches the responses for all `GET` requests, and all `POST` requests to Toggl Track's report endpoints.

```js
const projects = await toggl.projects.getAllQuickly()
console.log(projects)

// Clears the cache for all getAllQuickly() project requests
toggl.cache.clearFunction('TogglTrackProjects.getAllQuickly()')
// Clears the cache for all project requests
toggl.cache.clearFunction('TogglTrackProjects')
```

## Available actions

| Entity             | Create | Read All | Read One | Update | Delete |
| ------------------ | :----: | :------: | :------: | :----: | :----: |
| Projects           |        |    ✓     |    ✓     |        |        |
| Clients            |   ✓    |    ✓     |    ✓     |   ✓    |   ✓    |
| Tags               |   ✓    |    ✓     |    ✓     |        |   ✓    |
| Organization Users |        |    ✓     |    ✓     |        |        |
| User Groups        |        |    ✓     |    ✓     |   ✓    |        |
