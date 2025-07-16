import myCache from '@/utils/cacheStorage'

const KEYPREFIX = 'PINIA:STATE:'

export default (context) => {
  const { store } = context
  if(store.$id !== 'agent') return
  const KEY = KEYPREFIX + store.$id
  // 存
  window.addEventListener('beforeunload', () => {
    myCache.set(KEY, store.$state)
    console.log('存储state!')
  })
  // // 取
  try {
    const originState = myCache.get(KEY)
    store.$patch(originState)
  } catch {
    console.log('存储格式无效')
  }
}
