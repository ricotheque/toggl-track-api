export class TogglCache {
  constructor () {
    this.cache = {}
  }

  get (functionName, hashKey) {
    return this.cache[functionName] && this.cache[functionName][hashKey]
  }

  set (functionName, hashKey, data) {
    if (!this.cache[functionName]) {
      this.cache[functionName] = {}
    }
    this.cache[functionName][hashKey] = data
  }

  has (functionName, hashKey) {
    return !!(this.cache[functionName] && this.cache[functionName][hashKey])
  }

  clear (functionName, hashKey) {
    if (this.cache[functionName]) {
      delete this.cache[functionName][hashKey]
    }
  }

  clearFunction (functionName) {
    delete this.cache[functionName]
  }

  clearForClass (functionClass) {
    for (const key of Object.keys(this.cache)) {
      if (key.includes(functionClass)) {
        delete this.cache[key]
      }
    }
  }

  clearAll () {
    this.cache = {}
  }

  makeHash (input) {
    return JSON.stringify(input)
  }
}
