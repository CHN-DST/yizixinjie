import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
    meta: { title: '一字心解' },
  },
  {
    path: '/camera',
    name: 'Camera',
    component: () => import('@/pages/Camera.vue'),
    meta: { title: '输入测字' },
  },
  {
    path: '/result',
    name: 'Result',
    component: () => import('@/pages/Result.vue'),
    meta: { title: '分析结果' },
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/pages/History.vue'),
    meta: { title: '历史记录' },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/pages/Admin.vue'),
    meta: { title: '后台管理' },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/pages/About.vue'),
    meta: { title: '关于' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// 路由守卫 - 设置页面标题
router.afterEach((to) => {
  document.title = to.meta.title || '一字心解';
});

export default router;
