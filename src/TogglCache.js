export class TogglCache {
  getCache (id) {
    return this[id]
  }

  setCache (id, data) {
    this[id] = data
  }
}
