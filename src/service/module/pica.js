import MyRequest from '../request/index'

// 类别详情
export function getCategoryDetail(category, page) {
  MyRequest.setBaseUrl(`https://hi.yyaan.com/api/bika/category_list?category=${category}&page=${page}`)
  return MyRequest.get()
}
// 漫画详情
export function getPicaDetail(id) {
  MyRequest.setBaseUrl(`https://hi.yyaan.com/api/bika/comic_detail?id=${id}`)
  return MyRequest.get()
}
// 页面列表
export function getPicaPage(id, page) {
  MyRequest.setBaseUrl(`https://hi.yyaan.com/api/bika/comic_page?id=${id}&page=${page}`)
  return MyRequest.get()
}
// 搜索
export function searchPica(keyword, page) {
  MyRequest.setBaseUrl(
    `https://hi.yyaan.com/api/bika/advanced_search?keyword=${keyword}&page=${page}`,
  )
  return MyRequest.get()
}
