import myCache from '@/utils/cacheStorage'

export function filterNovelData(novels) {
  const isNSFW = myCache.get('isNSFW')
  if (isNSFW) {
    return novels
  } else {
    return novels.filter((item) => {
      const tags = item.tags
      return !tags.find((tag) => tag.name === 'R-18' || tag.name === 'R-18G')
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
