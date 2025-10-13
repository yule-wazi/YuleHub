import { LIMITSIZE } from '../config/globalVar.js'

export default function shuffling(count) {
  const n = Math.floor(count / LIMITSIZE) + 1
  let arr = []
  for (let i = 1; i <= n; i++) {
    arr.push(i)
  }
  for (let i = n - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
