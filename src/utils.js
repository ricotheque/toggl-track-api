export async function sleep(waitInMilliseconds) {
  return new Promise((resolve) => setTimeout(resolve, waitInMilliseconds))
}

export function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), "g"), replace)
}

export function escapeRegExp(string) {
  if (!string) {
    return ""
  }
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function objectToQueryString(obj) {
  const params = new URLSearchParams(Object.entries(obj))
  return params.toString()
}
