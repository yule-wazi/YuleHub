import { createRouter, createWebHashHistory } from 'vue-router'
import myCache from '@/utils/cacheStorage'
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/chat',
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/view/chat/chat.vue'),
      meta: { keepAlive: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/view/login/login.vue'),
      meta: { keepAlive: false },
    },
    {
      path: '/comics',
      name: 'comics',
      component: () => import('@/view/comics/comics.vue'),
      meta: { keepAlive: false },
    },
  ],
})
router.beforeEach((to) => {
  const userInfo = myCache.get('userInfo')
  if (to.path === '/chat' && !userInfo) {
    return '/login'
  }
  if (to.path === '/comics' && userInfo.role !== 1) {
    return '/login'
  }
})
export default router
