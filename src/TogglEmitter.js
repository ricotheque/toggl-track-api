export class TogglEmitter {
  constructor () {
    this.listeners = {}
  }

  on (event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  off (event, callback) {
    if (!this.listeners[event]) return

    const index = this.listeners[event].indexOf(callback)
    if (index !== -1) {
      this.listeners[event].splice(index, 1)
    }
  }

  emit (event, ...args) {
    // Emit for specific event listeners
    if (this.listeners[event]) {
      for (const callback of this.listeners[event]) {
        callback(...args)
      }
    }

    // Emit for wildcard listeners
    if (this.listeners['*']) {
      for (const callback of this.listeners['*']) {
        callback(event, ...args)
      }
    }
  }
}
