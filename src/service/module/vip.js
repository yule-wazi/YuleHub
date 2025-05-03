import MyRequest from '../request/index'
export function postVipList() {
  MyRequest.setBaseUrl('https://api.mossia.top/duckMo')
  return MyRequest.post({
    data: {
      num: 20,
      r18Type: 1,
      aiType: 0,
    },
  })
}
export function postNewVipList() {
  MyRequest.setBaseUrl('https://image.anosu.top/pixiv?num=30&&r18=1&&db=0')
  return MyRequest.post()
}
