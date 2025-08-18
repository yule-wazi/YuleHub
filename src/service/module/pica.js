import MyRequest from '../request/index'
import myCache from '@/utils/cacheStorage'
// 类别详情
export function getCategoryDetail(category, page) {
  const mostLike = myCache.get('mostLike')
  MyRequest.setBaseUrl(
    `https://hi.yyaan.com/api/bika/category_list?category=${category}&page=${page}&sort=${mostLike ? 'ld' : 'dd'}`,
  )
  return MyRequest.get()
}
// 漫画详情
export function getPicaDetail(id) {
  MyRequest.setBaseUrl(`https://hi.yyaan.com/api/bika/comic_detail?id=${id}`)
  return MyRequest.get()
}
// 页面列表
export function getPicaPage(id, page, order) {
  MyRequest.setBaseUrl(`https://hi.yyaan.com/api/bika/comic_page?id=${id}&page=${page}&order=${order}`)
  return MyRequest.get()
}
// 搜索
export function searchPica(keyword, page) {
  const mostLike = myCache.get('mostLike')
  MyRequest.setBaseUrl(
    `https://hi.yyaan.com/api/bika/advanced_search?keyword=${keyword}&page=${page}&sort=${mostLike ? 'ld' : 'dd'}`,
  )
  return MyRequest.get()
}
// 相关章节
export function getPicaSeries(id) {
  MyRequest.setBaseUrl(`https://hi.yyaan.com/api/bika/comic_episodes?id=${id}`)
  return MyRequest.get()
}
