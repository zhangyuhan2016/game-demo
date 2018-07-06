import Vue from 'vue'
import Router from 'vue-router'
import games from './views/Games.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'games',
      component: games
    }
  ]
})
