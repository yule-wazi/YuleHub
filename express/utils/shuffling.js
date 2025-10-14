import { LIMITSIZE } from '../config/globalVar.js'

export function shufflingPage(count) {
  const n = Math.floor(count / LIMITSIZE) + 1
  let arr = []
  for (let i = 1; i <= n; i++) {
    arr.push(i)
  }
  for (let i = n - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  arr.unshift(NaN)
  return arr
}

export function shufflingList(list) {
  const l = list.length
  for (let i = l - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}
