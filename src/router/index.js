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
      meta: { keepAlive: true },
      component: () => import('@/view/comics/comics.vue'),
      children: [
        {
          path: '/comics',
          redirect: '/comics/home',
        },
        {
          path: 'home',
          component: () => import('@/view/comics/view/home/home.vue'),
          meta: { keepAlive: true },
        },
        {
          path: 'category',
          component: () => import('@/view/comics/view/category/category.vue'),
          meta: { keepAlive: true },
        },
        {
          path: 'detail',
          component: () => import('@/view/comics/view/detail/detail.vue'),
        },
      ],
      meta: { keepAlive: false },
    },
    {
      path: '/novel',
      name: 'novel',
      meta: { keepAlive: true },
      component: () => import('@/view/novel/novel.vue'),
      children: [
        {
          path: '/novel',
          redirect: '/novel/home',
        },
        {
          path: 'home',
          component: () => import('@/view/novel/view/home/home.vue'),
          meta: { keepAlive: true },
        },
        {
          path: 'detail',
          component: () => import('@/view/novel/view/detail/detail.vue'),
        },
        {
          path: 'category',
          component: () => import('@/view/novel/view/category/category.vue'),
        },
      ],
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
