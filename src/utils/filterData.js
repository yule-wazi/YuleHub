import myCache from '@/utils/cacheStorage'

export function filterNovelData(novels) {
  const isNSFW = myCache.get('isNSFW')
  if (isNSFW) {
    return novels
  } else {
    return novels.filter((item) => {
      const tags = item.tags
      return !tags.find((tag) => tag.name === 'R-18')
    })
  }
}
