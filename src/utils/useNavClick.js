import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  Hide,
  View,
  Expand,
  Close,
  Sunny,
  Moon,
  HomeFilled,
  PictureFilled,
  Management,
  Collection,
  VideoCameraFilled,
} from '@element-plus/icons-vue'
import myLocalCache, { sessionCache } from './cacheStorage'

export function useNavClick(drawer, iconAction) {
  const router = useRouter()
  // 回到首页
  const goHome = () => {
    router.push('/')
  }
  // 转到插画
  const goComics = () => {
    drawer.value = false
    router.push('/comics')
  }
  // 转到漫画
  const goPica = () => {
    drawer.value = false
    router.push('/pica')
  }
  // 转到小说
  const goNovel = () => {
    drawer.value = false
    router.push('/novel')
  }
  // 转到动画
  const goVideo = () => {
    drawer.value = false
    router.push('/video')
  }

  // 封装导航栏循环
  const navList = [
    { text: '首页', icon: HomeFilled, action: 'goHome' },
    { text: '插画', icon: PictureFilled, action: 'goComics' },
    { text: '漫画', icon: Collection, action: 'goPica', role: 999 },
    { text: '小说', icon: Management, action: 'goNovel' },
    { text: '动漫', icon: VideoCameraFilled, action: 'goVideo' },
  ]
  // 如果有权限过滤逻辑，可以使用
  const userInfo = myLocalCache.get('userInfo')
  const filteredNavList = computed(() => {
    return navList.filter((item) => {
      return !item.role || userInfo.role === item.role
    })
  })
  // 定义一个统一的点击处理函数
  const handleNavClick = (actionName) => {
    const methods = {
      goHome,
      goComics,
      goPica,
      goNovel,
      goVideo,
    }
    if (methods[actionName]) {
      iconAction.value = actionName
      sessionCache.set('iconAction', actionName)
      methods[actionName]()
    }
  }

  return { filteredNavList, handleNavClick }
}
