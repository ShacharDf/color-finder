import Vue from 'vue'
import VueRouter from 'vue-router'
import colorPick from '../views/colorPick.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'color-pick',
    component: colorPick
  },
]

const router = new VueRouter({
  routes
})

export default router
