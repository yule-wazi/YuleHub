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

export function useNavClick(drawer = null, iconAction = null) {
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
      fullName: 'YuleHub',
      icon: HomeFilled,
      action: 'goHome',
    },
    {
      text: '插画',
      fullName: 'Yule插画',
      icon: PictureFilled,
      img: 'https://i.pximg.org/img-master/img/2025/07/31/15/17/02/133318656_p0_master1200.jpg',
      action: 'goComics',
    },
    {
      text: '漫画',
      fullName: 'Yule漫画',
      icon: Collection,
      img: 'https://i.pximg.org/img-master/img/2025/04/27/18/00/27/129760572_p0_master1200.jpg',
      action: 'goPica',
      role: 999,
    },
    {
      text: '小说',
      fullName: 'Yule小说',
      icon: Management,
      img: 'https://i.pximg.org/novel-cover-master/img/2026/01/01/00/49/54/sci15170940_ee5a5a92e96bf0d4ce9f84bf74d2814c_master1200.jpg',
      action: 'goNovel',
    },
    {
      text: '动漫',
      fullName: 'Yule动漫',
      icon: VideoCameraFilled,
      img: 'https://i.pximg.org/img-master/img/2025/09/07/00/13/43/134795768_p0_master1200.jpg',
      action: 'goVideo',
    },
  ]
  // 映射表：将字符串映射到具体函数
  const actionMethods = { goHome, goComics, goPica, goNovel, goVideo }

  // 如果有权限过滤逻辑，可以使用
  const userInfo = myLocalCache.get('userInfo')
  const filteredNavList = computed(() => {
    return navList.filter((item) => {
      return !item.role || userInfo.role === item.role
    })
  })

  /**
   * 统一点击处理
   * @param {String} identifier - 可以是 action 名 (如 'goHome') 也可以是 fullName (如 'YuleHub')
   */
  const handleNavClick = (identifier) => {
    // 1. 在 navList 中查找匹配项（匹配 action 或 fullName）
    const target = navList.find(
      (item) => item.action === identifier || item.fullName === identifier,
    )
    if (target && actionMethods[target.action]) {
      const actualAction = target.action
      // 更新状态和缓存
      if (iconAction) {
        iconAction.value = actualAction
        sessionCache.set('iconAction', actualAction)
      }
      // 执行函数
      actionMethods[actualAction]()
    } else {
      console.warn(`未找到匹配的导航动作: ${identifier}`)
    }
  }

  return { filteredNavList, handleNavClick }
}
