import myCache from '@/utils/cacheStorage'

const KEYPREFIX = 'PINIA:STATE:'

export default (context) => {
  const { store } = context
  // 判断是否存储
  const isMemory = myCache.get('isMemory')
  if(!isMemory) {
    myCache.remove('PINIA:STATE:agent')
    return;
  }
  // 只对agent进行存储
  if(store.$id !== 'agent') return
  const KEY = KEYPREFIX + store.$id

  // 存
  store.$subscribe((mutation, state) => {
    myCache.set(KEY, state)
  })
  // // 取
  try {
    const originState = myCache.get(KEY)
    store.$patch(originState)
  } catch {
    console.log('存储格式无效')
  }
}
