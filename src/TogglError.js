export class TogglError extends Error {
  constructor (message) {
    super(message)
    this.name = ''
  }
}
