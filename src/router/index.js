import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/following',
      name: 'following',
      component: () => import('../views/Following.vue')
    },
    {
      path: '/foryou',
      name: 'foryou',
      component: () => import('../views/Foryou.vue')
    }
  ]
})

export default router
