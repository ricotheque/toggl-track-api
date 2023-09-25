import { TogglTrackAPI } from './TogglTrackAPI'

export class TogglTrackUserGroups extends TogglTrackAPI {
  constructor (options, users) {
    super(options)
    this.users = users
  }

  async getAll () {
    const result = await this.restRequest(
      'GET',
      '/api/v9/organizations/{{organization_id}}/groups',
      null,
      'json',
      'TogglTrackUserGroups.getAll()'
    )

    return result
  }

  async getByName (groupName) {
    const groups = await this.getAll()
    for (const group of groups) {
      if (group.name === groupName) return group
    }

    return false
  }

  async setUsers (groupName, userIds) {
    const groupId = await this.getGroupId(groupName)

    if (groupId === false) {
      return false
    }

    const result = await this.restRequest(
      'PUT',
      '/api/v9/organizations/{{organization_id}}/groups/' + groupId,
      {
        name: groupName,
        users: userIds
      },
      'json',
      'TogglTrackUserGroups.setUsers()'
    )

    return result
  }

  async addUsers (groupName, userEmails) {
    const userIds = await this.users.convertEmailsToUserIds(userEmails)
    const currentGroupUserIds = await this.getUserIds(groupName)

    if (userIds === false || currentGroupUserIds === false) {
      return false
    }

    const newUserIds = [...new Set([...currentGroupUserIds, ...userIds])]

    if (
      newUserIds.length !== currentGroupUserIds.length &&
      newUserIds.length > 0
    ) {
      const userEmailsString = Array.isArray(userEmails)
        ? userEmails.join(', ')
        : userEmails

      this.emit(
        'TogglTrackUserGroups.addUsers()',
        `Attempting to add ${userEmailsString} from user group ${groupName}`
      )

      return await this.setUsers(groupName, newUserIds)
    } else {
      return false
    }
  }

  async removeUsers (groupName, userEmails) {
    const userIds = await this.users.convertEmailsToUserIds(userEmails)
    const currentGroupUserIds = await this.getUserIds(groupName)
    const userIdsToRemove = new Set(userIds)

    const newUserIds = currentGroupUserIds.filter(
      (user) => !userIdsToRemove.has(user)
    )

    if (
      newUserIds.length !== currentGroupUserIds.length &&
      newUserIds.length > 0
    ) {
      const userEmailsString = Array.isArray(userEmails)
        ? userEmails.join(', ')
        : userEmails
      this.emit(
        'TogglTrackUserGroups.removeUsers()',
        `Attempting to remove ${userEmailsString} from user group ${groupName}`
      )

      return await this.setUsers(groupName, newUserIds)
    } else {
      return false
    }
  }

  async getGroupId (groupName) {
    const group = await this.getByName(groupName)

    return group.group_id
  }

  async getUserIds (groupName) {
    const group = await this.getByName(groupName)

    if (group === false) {
      return false
    }

    return group.users.map((user) => user.user_id)
  }
}
