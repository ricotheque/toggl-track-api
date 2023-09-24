export class TogglError extends Error {
  constructor (message, options) {
    super(message, options)
    this.name = ''
  }
}
