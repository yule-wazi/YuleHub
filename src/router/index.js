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
      component: () => import('@/view/chat/chat.vue'),
    },
    {
      path: '/login',
      component: () => import('@/view/login/login.vue'),
    },
  ],
})
router.beforeEach((to) => {
  const userInfo = myCache.get('userInfo')
  if (to.path === '/chat' && !userInfo) {
    return '/login'
  }
})
export default router
