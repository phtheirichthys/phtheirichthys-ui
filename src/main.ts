import { createPinia } from 'pinia'
import VConsole from 'vconsole'
import { createApp } from 'vue'
import { createWebHashHistory, createRouter } from 'vue-router'

import App from './App.vue'

import 'bulma/css/bulma.css'

import 'leaflet/dist/leaflet.css'
import 'leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css'
import 'leaflet-sidebar-v2/css/leaflet-sidebar.css'

import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'

const pinia = createPinia()

const app = createApp(App)
app.use(pinia)

new VConsole()

import Home from './components/Home.vue'
import Polars from './components/Polars.vue'
import Races from './components/Races.vue'
import Route from './components/Route.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/polars', component: Polars },
  { path: '/races', component: Races },
  { name: 'navigate', path: '/:boat/:race', component: Route, props: true }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

app.use(router)
app.mount('#app')
