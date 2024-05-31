import { createApp } from 'vue'
import { createWebHashHistory, createRouter } from 'vue-router'

import App from './App.vue'

import * as phtheirichthys from '@phtheirichthys/phtheirichthys'
import { WindService } from './lib/wind'
import { PolarService } from './lib/polar'

import 'bulma/css/bulma.css'

import 'leaflet/dist/leaflet.css'
import 'leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css'
import 'leaflet-sidebar-v2/css/leaflet-sidebar.css'

import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'

import Route from './components/Route.vue'
import Polars from './components/Polars.vue'
import Races from './components/Races.vue'

const routes = [
  { path: '/', component: Route },
  { path: '/polars', component: Polars },
  { path: '/races', component: Races },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

createApp(App)
  .use(router)
  .mount('#app')

phtheirichthys.add_wind_provider().then(() => {
    try {
        let status = WindService.status()
        console.log(status)
    } catch (e) {
        console.log("Error getting status")    
    }
})

PolarService.add_polar()
