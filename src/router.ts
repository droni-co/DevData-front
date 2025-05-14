import { createWebHistory, createRouter } from 'vue-router'

import home from './pages/index.vue'
import about from './pages/about.vue'
import secrets from './pages/secrets.vue'
import copilot from './pages/copilot.vue'

const routes = [
  { path: '/', component: home },
  { path: '/about', component: about },
  { path: '/secrets', component: secrets },
  { path: '/copilot', component: copilot },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})