// This class lets us remove the "Error: " prefix from error messages
export class TogglError extends Error {
  constructor (message, options) {
    super(message, options)
    this.name = ''
  }
}
