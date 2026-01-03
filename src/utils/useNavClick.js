import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  HomeFilled,
  PictureFilled,
  Management,
  Collection,
  VideoCameraFilled,
} from '@element-plus/icons-vue'
import myLocalCache, { sessionCache } from './cacheStorage'

export function useNavClick(drawer = null, iconAction) {
  const router = useRouter()
  // 回到首页
  const goHome = () => {
    router.push('/home')
  }
  // 转到插画
  const goComics = () => {
    if (drawer) {
      drawer.value = false
    }
    router.push('/comics')
  }
  // 转到漫画
  const goPica = () => {
    if (drawer) {
      drawer.value = false
    }
    router.push('/pica')
  }
  // 转到小说
  const goNovel = () => {
    if (drawer) {
      drawer.value = false
    }
    router.push('/novel')
  }
  // 转到动画
  const goVideo = () => {
    if (drawer) {
      drawer.value = false
    }
    router.push('/video')
  }

  // 封装导航栏循环
  const navList = [
    {
      text: '首页',
      icon: HomeFilled,
      action: 'goHome',
    },
    {
      text: '插画',
      icon: PictureFilled,
      img: 'https://i.pximg.org/img-master/img/2025/07/31/15/17/02/133318656_p0_master1200.jpg',
      action: 'goComics',
    },
    {
      text: '漫画',
      icon: Collection,
      action: 'goPica',
      img: 'https://i.pximg.org/img-master/img/2025/04/27/18/00/27/129760572_p0_master1200.jpg',
      role: 999,
    },
    {
      text: '小说',
      icon: Management,
      img: 'https://i.pximg.org/novel-cover-master/img/2026/01/01/00/49/54/sci15170940_ee5a5a92e96bf0d4ce9f84bf74d2814c_master1200.jpg',
      action: 'goNovel',
    },
    {
      text: '动漫',
      icon: VideoCameraFilled,
      img: 'https://i.pximg.org/img-master/img/2025/09/07/00/13/43/134795768_p0_master1200.jpg',
      action: 'goVideo',
    },
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
