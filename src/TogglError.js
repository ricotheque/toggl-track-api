// This class just let's us remove the "Error: " prefix from error messages
export class TogglError extends Error {
  constructor (message, options) {
    super(message, options)
    this.name = ''
  }
}
