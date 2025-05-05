import { switchProxyUrl } from '@/utils/ProxyUrl'
import MyRequest from '../request/index'
import { shuffleArray } from '@/utils/handleArray'
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
// const HOST = '192.168.204.247'
const HOST = 'localhost'
// 获取画师作品id列表
function getPixivUID(uid) {
  MyRequest.setBaseUrl(
    `http://${HOST}:3000/proxy?url=${encodeURIComponent(`https://open.pximg.org/works.php?uid=${uid}`)}`,
  )
  return MyRequest.get()
}
// 获取id作品
function getPixivPID(pid) {
  MyRequest.setBaseUrl(
    `http://${HOST}:3000/proxy?url=${encodeURIComponent(`https://open.pximg.org/pid.php?pid=${pid}`)}`,
  )
  return MyRequest.get()
}
// 获取作者所有作品图片
export async function getAllPixivImg(uid) {
  const uidRes = await getPixivUID(uid)
  const uidList = shuffleArray([...uidRes.data.body.user_illust_ids]).slice(0, 20)
  console.log(uidList)
  const pidPromises = uidList.map(async (pid) => {
    const pidRes = await getPixivPID(pid)
    const pidUrl = pidRes.data.master
    return switchProxyUrl(pidUrl)
  })
  let pidList = await Promise.all(pidPromises)
  console.log(pidList)
  return pidList
}
