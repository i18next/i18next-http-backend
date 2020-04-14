const arr = []
const each = arr.forEach
const slice = arr.slice

export function defaults (obj) {
  each.call(slice.call(arguments, 1), (source) => {
    if (source) {
      for (var prop in source) {
        if (obj[prop] === undefined) obj[prop] = source[prop]
      }
    }
  })
  return obj
}
