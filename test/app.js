const { TogglTrack } = require('../src/TogglTrack')

const toggl = new TogglTrack({
  // Get your api token from track.toggl.com/profile.
  apiToken: '[your_token]',
  organizationId: '1234567',
  workspaceId: '1234567',
  // Wait time between API requests. Default is 1000. Can never be lower than 1000.
  waitInMilliseconds: 1000,
  // Maximum times API requests are attempted before an error is returned. Default is 3. Can never be lower than 1.
  maxRetries: 3
})

// Use the class emitters to surface progress messages
toggl.registerListeners((eventName, data) => {
  console.log(`${eventName}:`, data)
  document.getElementById('status').textContent = data
})
