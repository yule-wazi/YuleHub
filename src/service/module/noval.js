import MyRequest from '../request/index'

export function getNewNoval() {
  MyRequest.setBaseUrl(`https://hibiapi.getloli.com/api/pixiv/novel_new`)
  return MyRequest.get()
}
