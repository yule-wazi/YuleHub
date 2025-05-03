export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export function sortArray(array) {
  const regex = /_p(\d+)_/
  function _compareNumbers(texta, textb) {
    const a = texta.match(regex)[1] * 1
    const b = textb.match(regex)[1] * 1
    return a - b
  }
  return array.sort(_compareNumbers)
}
