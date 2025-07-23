import MyRequest from '../request/index'

export function getNewNovel() {
  MyRequest.setBaseUrl(`https://hibiapi.getloli.com/api/pixiv/novel_new`)
  return MyRequest.get()
}
export function getNovelText(id) {
  MyRequest.setBaseUrl(`https://hibiapi.getloli.com/api/pixiv/novel_text?id=${id}`)
  return MyRequest.get()
}
export function getCategoryNovel(word, page = 1) {
  MyRequest.setBaseUrl(
    `https://hibiapi.getloli.com/api/pixiv/search_novel?word=${word}&page=${page}`,
  )
  return MyRequest.get()
}
