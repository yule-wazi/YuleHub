import myCache from '@/utils/cacheStorage'

export function filterNovelData(novels) {
  const isNSFW = myCache.get('isNSFW')
  if (isNSFW) {
    return novels
  } else {
    return novels.filter((item) => {
      return !item.x_restrict
    })
  }
}
export function filterComicsData(comics) {
  const isNSFW = myCache.get('isNSFW')
  if (isNSFW) {
    return comics
  } else {
    return comics.filter((item) => {
      return !item.x_restrict
    })
  }
}
