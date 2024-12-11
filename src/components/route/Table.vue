<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouteStore, emitter as routeEmitter } from '../../stores/route';
import { useSnakeStore } from '../../stores/snake';
import { Penalty, RouteWaypoint, Sail } from '@phtheirichthys/phtheirichthys';
import * as utils from '../../lib/utils';

const props = defineProps<{
  display: boolean
}>()

const routeStore = useRouteStore()
const snakeStore = useSnakeStore()

const table = ref("route")
const eta = ref(true)

// function formatHours(duration: number) {
//   return Math.floor(duration / 24) * 24 + Math.round(duration % 24)
// }

function highlight(date: Date) {
  if (table.value == "route") {
    routeEmitter.emit("highlight", date)
  }
}

function unhighlight(date: Date) {
  if (table.value == "route") {
    routeEmitter.emit("unhighlight", date)
  }
}


function sailClass(sail: Sail) {
  const sails = ["Jib", "Spi", "Stay", "LJ", "C0", "HG", "LG"];

  return sails[sail.index]
}

interface Line {
  duration: number
  current: boolean
  outdated: boolean
  eta: number
  date: Date
  heading: number
  twa: number
  wp: RouteWaypoint
}

const route = ref<Array<Line> | null>(null)
const progs = ref<Array<Line> | null>(null)

compute_route()
watch(() => routeStore.route, () => {
  compute_route()
})

function compute_route() {
  if (routeStore.route) {
    route.value = compute([[routeStore.route.way, routeStore.route.infos.start]])
  } else {
    route.value = null
  }
}

compute_progs()
watch(() => snakeStore.progs, () => {
  compute_progs()
}, {deep: true})

function compute_progs() {
  if (snakeStore.progs && snakeStore.progs.length > 0) {
    let ps = new Array<[Array<RouteWaypoint>, Date]>
    for (let p of snakeStore.progs) {
      ps.unshift([p.waypoints, p.start_date])
    }
    progs.value = compute(ps)
  } else {
    progs.value = null
  }
}

function compute(sources: Array<[Array<RouteWaypoint>, Date]>): Array<Line> {
  const now = new Date()

  let res = []
  let currentFounded = false

  for (let [source, start] of sources) {
    for (let i = source.length - 1; i >= 0 ; i--) {
      const wp = source[i]

      let date = new Date(start)
      date.setSeconds(date.getSeconds() + wp.duration);

      const eta = (date.getTime() - now.getTime())

      let current = false
      if (eta <= 0 && !currentFounded) {
        current = eta <= 0
        currentFounded = true
      }
      const outdated = eta <= 0 && !current
      res.unshift({
        current,
        outdated,
        eta: (date.getTime() - now.getTime()) / 1000,
        duration: wp.duration,
        date,
        heading: utils.heading(wp.boat_settings.heading, wp.status.wind.direction),
        twa: utils.twa(wp.boat_settings.heading, wp.status.wind.direction),
        wp,
      })
    }
  }

  return res
}

function formatDuration(duration: number): String {
  var d = duration > 0 ? "+" : "-"

  let delta = Math.abs(duration / 3600)
  var j = Math.floor(delta / 24)
  var h = Math.floor(delta % 24)
  var m = Math.round(60 * (delta - j * 24 - h))
  if (m == 60) {
    m = 0
    h ++
  }
  if (h == 24) {
    h = 0
    j ++
  }

  if(j > 0) {
    d += j + "j"
  }
  if(h > 0) {
    d += String(h).padStart(2, ' ') + "h"
  }
  if(m > 0) {
    d += String(m).padStart(2, ' ') + "m"
  }

  return d
}

function formatDate(date: Date): String {
  return date.getFullYear().toString() + "-" + date.getMonth().toString().padStart(2, "0") + date.getDay().toString().padStart(2, "0") + " " + date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0")
}

function formatPenalties(penalties: Penalty[]) {
  if (!penalties || penalties.length == 0) {
    return ""
  }

  var res = ""

  for (var p of penalties) {
    let type = ""
    if (p.typ == 1) {
      type = "Gybe"
    } else if (p.typ== 2) {
      type = "Tack"
    } else if (p.typ == 4) {
      type = "Sail"
    }

    const minutes = (p.duration / 60).toFixed(0)
    const secondes = String(p.duration % 60).padStart(2, '0')

    if (res.length > 0) {
      res += " - "
    }

    res += type + ": " + minutes+"'"+secondes+"\" " + (p.ratio * 100).toFixed(0) + "%"
  }

  return res
}

function formatVmgs(wp: RouteWaypoint): string {

  if (wp.boat_settings.sail.index == 1 || wp.boat_settings.sail.index == 5 || wp.boat_settings.sail.index == 6) {
    console.log("VMG DOWN : ", wp.status.vmgs?.down.twa)
    return wp.status.vmgs?.optimized_down?.twa.toString() + "-" +  wp.status.vmgs?.down.twa.toString()
  }

  if (wp.boat_settings.sail.index == 0 || wp.boat_settings.sail.index == 2 || wp.boat_settings.sail.index == 3) {
    return wp.status.vmgs?.up.twa.toString() + "°"
  }

  return ""
}

</script>

<template>
  <div class="container" style="overflow-x:scroll;">

    <div v-if="props.display" style="display: inline-block">
      <!-- <nav v-if="routeStore.route" class="level is-mobile">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Standard</p>
            <p class="title">{{ formatHours(routeStore.route.sumup.sailsDuration[0] + routeStore.route.sumup.sailsDuration[1]) }} hrs</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">LG</p>
            <p class="title">{{ formatHours(routeStore.route.sumup.sailsDuration[3] + routeStore.route.sumup.sailsDuration[6]) }} hrs</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Code 0</p>
            <p class="title">{{ formatHours(routeStore.route.sumup.sailsDuration[4]) }} hrs</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">HG</p>
            <p class="title">{{ formatHours(routeStore.route.sumup.sailsDuration[2] + routeStore.route.sumup.sailsDuration[5]) }} hrs</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Foil</p>
            <p class="title">{{ formatHours(routeStore.route.sumup.foilDuration) }} hrs</p>
          </div>
        </div>
      </nav> -->

      <div v-if="snakeStore.progs && snakeStore.progs.length > 0 || table == 'progs'" class="tabs is-toggle">
        <ul>
          <li v-if="routeStore.route && routeStore.route.way.length > 0" :class="{'is-active': table == 'route'}"><a @click="table = 'route'">Route</a></li>
          <li v-if="snakeStore.progs && snakeStore.progs.length > 0" :class="{'is-active': table == 'progs'}"><a @click="table = 'progs'">Programmations</a></li>
        </ul>
      </div>

      <table v-if="table == 'route' && routeStore.route || table == 'progs' && snakeStore.progs" class="table is-fullwidth is-narrow is-bordered monospace" style="white-space: nowrap;">
        <thead>
          <tr>
            <th v-if="eta" class="is-clickable has-text-centered" @click="eta = !eta">ETA</th>
            <th v-else class="is-clickable has-text-centered" @click="eta = !eta">Duration</th>
            <th class="has-text-centered">Date</th>
            <th class="has-text-centered"><i class='fa fa-compass'></i></th>
            <th class="has-text-centered"><i class='fa fa-location-arrow'></i></th>
            <th class="has-text-centered">V</th>
            <th class="has-text-centered">F</th>
            <th class="has-text-centered">B</th>
            <th class="has-text-centered" colspan="2"><i class='fa fa-wind'></i></th>
            <th class="has-text-centered"><i class='fa fa-ship'></i></th>
            <th class="has-text-centered"><i class='far fa-face-smile'></i></th>
            <th class="has-text-centered"><i class='fa fa-clock'></i></th>
            <th class="has-text-centered">Latitude</th>
            <th class="has-text-centered">Longitude</th>
          </tr>
        </thead>

        <tr
            v-for="wp in table == 'route' ? route : progs"
            :key="wp.duration"
            v-bind:class="{'has-background-primary-light': wp.current, 'has-background-grey-lighter': wp.outdated}"
            @mouseover="highlight(wp.date)"
            @mouseleave="unhighlight(wp.date)">
          <td v-if="eta" class="has-text-right">{{ formatDuration(wp.eta) }}</td>
          <td v-else class="has-text-right">{{ formatDuration(wp.duration) }}</td>
          <td class="has-text-right">{{ formatDate(wp.date) }}</td>
          <td class="has-text-right">{{ wp.heading.toFixed(1) }}°</td>
          <td class="has-text-right has-tooltip-right" :class="{'has-text-danger': wp.twa < 0, 'has-text-success': wp.twa > 0}" :data-tooltip="formatVmgs(wp.wp)">{{ wp.twa.toFixed(1) }}°</td>
          <td :class="sailClass(wp.wp.boat_settings.sail)">{{ utils.sail_name(wp.wp.boat_settings.sail) }}</td>
          <td><span v-if="wp.wp.status.foil > 0" class='foil has-tooltip-right' v-bind:style="{opacity: wp.wp.status.foil + '%'}" :data-tooltip="wp.wp.status.foil + '%'"><i class='fa fa-fighter-jet'></i></span></td>
          <td><span v-if="wp.wp.status.boost > 0" class='foil has-tooltip-right' v-bind:style="{opacity: wp.wp.status.boost + '%'}" :data-tooltip="wp.wp.status.boost + '%'"><i class='fa fa-rocket'></i></span></td>
          <td class="has-text-right">{{ wp.wp.status.wind.direction.toFixed(1) }}°</td>
          <td class="has-text-right">{{ wp.wp.status.wind.speed.toFixed(1) }} kt</td>
          <td class="has-text-right">{{ wp.wp.status.boat_speed.toFixed(1) }} kt</td>
          <td class="has-text-right">{{ wp.wp.status.stamina.toFixed(0) }}</td>
          <td>{{ formatPenalties(wp.wp.status.penalties) }}</td>
          <td>{{ utils.lat2string(utils.dd2dms(wp.wp.from.lat)) }}</td>
          <td>{{ utils.lon2string(utils.dd2dms(wp.wp.from.lon)) }}</td>
        </tr>
      </table>

      <!-- <download-csv v-if="table == 'route' && routeStore.route || table == 'progs' && snakeStore.progs" :data="table == 'route' ? route : progs" name="phtheirichthys-route.csv" delimiter=";"
          :fields="['date', 'dlat', 'dlon', 'bearing', 'twa', 'wind', 'windSpeed', 'boatSpeed', 'sail']"
          :labels="{date: 'Date', dlat: 'Latitude', dlon: 'Longitude', bearing: 'HDG', twa: 'TWA', wind: 'TWD', windSpeed: 'TWS', boatSpeed: 'Speed', sail: 'Sail'}"
          >
        <button class="button">
          <span class="icon">
            <i class="fas fa-file-download"></i>
          </span>
          <span>csv</span>
        </button>
        <img src="download_icon.png">
      </download-csv> -->

    </div>
  </div>
</template>


<style scoped>
.monospace {
  font-family: Roboto Mono,SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;
}
.outdated {
  background-color: #fafafa;
}
.Jib {
  background-color: #ff9999;
}
.LJ {
  background-color: #ffff99;
}
.Stay {
  background-color: #99ff99;
}
.C0 {
  background-color: #99ddff;
}
.HG {
  background-color: #ff99ff;
}
.LG {
  background-color: #ffdd99;
}
.Spi {
  background-color: #9999ff;
}
</style>
