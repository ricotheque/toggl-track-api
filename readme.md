# Toggl Track API

An (unofficial!) work-in-progress JS client for https://toggl.com/track/.

## Basic setup

```js
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

toggl.cache.clearFunction('TogglTrackProjects.getAllQuickly()')
const projects2 = await toggl.projects.getAllQuickly()
console.log(projects2)
```

## Available actions

| Entity             | Create | Read All | Read One | Update | Delete |
| ------------------ | :----: | :------: | :------: | :----: | :----: |
| Projects           |        |    ✓     |    ✓     |        |        |
| Clients            |        |    ✓     |    ✓     |        |        |
| Tags               |   ✓    |    ✓     |    ✓     |        |   ✓    |
| Organization Users |        |    ✓     |    ✓     |        |        |
| User Groups        |        |    ✓     |    ✓     |   ✓    |        |
