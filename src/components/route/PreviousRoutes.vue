<script setup lang="ts">
import L from 'leaflet'

import { onMounted, ref } from 'vue';
import { useRouteStore, emitter as routeEmitter, PreviousRoute } from '../../stores/route'
import * as utils from '../../lib/utils'
import { useWindStore } from '../../stores/wind'

const props = defineProps<{
  map: L.Map | L.LayerGroup,
  layerControl: L.Control.Layers,
}>()

const routeStore = useRouteStore()
const windStore = useWindStore()

const layer = L.layerGroup()
layer.addTo(props.map)

routeStore.$onAction(({
  name, // name of the action
  after, // hook after the action returns or resolves
}) => {
  if (name === "navigate" || name === "load") {
    after(() => {
      refresh()
    })
  }
})

function refresh() {
    layer.clearLayers()

    draw()
}

const markers = ref<Array<[Date, L.Marker, L.DivIcon, L.DivIcon]> | null>(null)
function draw() {

  const _darkIcon = new L.DivIcon({
    iconSize: new L.Point(20, 20),
    className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon dark'
  })
  const _darkIconHighlighted = new L.DivIcon({
    iconSize: new L.Point(20, 20),
    className: 'leaflet-div-icon leaflet-editing-icon highlighted leaflet-touch-icon dark'
  })

  markers.value = new Array<[Date, L.Marker, L.DivIcon, L.DivIcon]>()
  routeStore.previousRoutes.filter((r) => !r.hidden).forEach((route) => {
    route.way.forEach((waypoint) => {
      let date = new Date(route.infos.start)
      date.setSeconds(date.getSeconds() + waypoint.duration)

      let marker = L.marker([waypoint.from.lat, waypoint.from.lon], {icon: _darkIcon, zIndexOffset: 25})
            .bindTooltip(() => utils.getTooltipTitle(new Date(route.infos.start), waypoint), {permanent: false, opacity: 0.9, offset: L.point(10, 0), className: 'draw-tooltip', direction: 'right'})
            .on("click", () => {
              windStore.now = date
            })
            .addTo(layer)

      markers.value!.push([date, marker, _darkIcon, _darkIconHighlighted])
    })
    var polylineOptions = {
        color: route.color,
        weight: 1,
      }
    L.polyline(route.way.map((wp) => [wp.from.lat, wp.from.lon]), polylineOptions).addTo(layer)
  })

}
   
onMounted(() => {
  refresh()
})

function formatDate(date: Date): string {
  return date.getFullYear() + "-"
  + (date.getMonth() + 1).toString().padStart(2, "0") + "-"
  + date.getDate().toString().padStart(2, "0") + " "
  + date.getHours().toString().padStart(2, "0") + ":"
  + date.getMinutes().toString().padStart(2, "0")
}

function switchLock(route: PreviousRoute) {
  route.lock = !route.lock
  save()
}

function switchEye(route: PreviousRoute) {
  route.hidden = !route.hidden
  save()
}

function save() {
  routeStore.save().then(() => refresh())
}

function remove(index: number) {
  routeStore.previousRoutes.splice(index, 1)
  save()
}

routeEmitter.on('highlight', date => {
  if (!markers.value) return
  let i = 1
  for (; i < markers.value.length ; i++) {
    if (markers.value[i][0] > date) {
      break
    }
  }
  markers.value[i][1].setIcon(markers.value[i][3] as L.DivIcon)
})

routeEmitter.on('unhighlight', date => {
  if (!markers.value) return
  let i = 1
  for (; i < markers.value.length ; i++) {
    if (markers.value[i][0] > date) {
      break
    }
  }
  markers.value[i][1].setIcon(markers.value[i][2] as L.DivIcon)
})
</script>

<template>
  <div v-for="(route, index) of routeStore.previousRoutes" :key="route.infos.start" class="card mb-3">
    <div class="card-content p-2">
      <div class="media mb-1">
        <div class="media-content">
          <input v-if="true" v-model="route.name" class="title input is-small" type="text" @change="save">
        </div>
        <div class="media-right">
          <button v-show="true" class="button is-small is-white" @click="switchEye(route)">
            <span v-if="!route.hidden" class="icon is-small">
              <i class="fa-solid fa-eye"></i>
            </span>
            <span v-else class="icon is-small">
              <i class="fa-solid fa-eye-slash"></i>
            </span>
          </button>
          <button v-show="true" class="button is-small is-white" @click="switchLock(route)">
            <span v-if="route.lock" class="icon is-small">
              <i class="fa-solid fa-lock"></i>
            </span>
            <span v-else class="icon is-small">
              <i class="fa-solid fa-lock-open"></i>
            </span>
          </button>
          <button v-show="true" class="button is-small is-white" @click="remove(index)">
            <span class="icon is-small">
              <i class="fas fa-trash"></i>
            </span>
          </button>
        </div>
      </div>
      <div class="content">
        <div class="columns is-gapless is-vcentered is-mobile">
            <div class="column">
              {{ formatDate(route.infos.start) }}
            </div>
            <div class="column">
              <div class="field has-addons">
                <p class="control" style="margin-bottom: 0px">
                  <button class="button is-small"><span class="icon is-small" :style="{'color':route.color}"><i class="fas fa-square-full"></i></span></button>
                </p>
                <p class="control">
                  <input v-if="true" v-model="route.color" class="input is-small" type="text" @change="save">
                </p>
              </div>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<style>
.leaflet-div-icon.leaflet-editing-icon {
  border: 8px solid transparent;
  background-clip: padding-box;
}
.leaflet-div-icon.leaflet-editing-icon.highlighted,
.leaflet-div-icon.leaflet-editing-icon:hover {
  border: 6px solid transparent;
  background-clip: padding-box;
}

.leaflet-div-icon.leaflet-editing-icon.leaflet-touch-icon.dark {
    background: "#cccccc";
    border-radius: 50%;
    color: "#777777";
    opacity: 0.4;
    background-clip: padding-box;
}

.leaflet-div-icon.leaflet-editing-icon.highlighted.leaflet-touch-icon.dark {
  opacity: 0.6;
}

.leaflet-div-icon.leaflet-editing-icon.leaflet-touch-icon.standard {
    background: white;
    /* border-radius: 50%; */
    color: "#ffffff";
}

.leaflet-div-icon.leaflet-editing-icon.leaflet-touch-icon.night {
    background: red;
    color: "#ff0000";
    background-clip: padding-box;
}

.leaflet-div-icon.leaflet-editing-icon.leaflet-touch-icon.changed {
    background: blue;
    /* border-radius: 50%; */
    background-clip: padding-box;
}

.leaflet-div-icon.leaflet-editing-icon.leaflet-touch-icon.night-changed {
    background: orange;
    color: "#ff0000";
    /* border-radius: 50%; */
    background-clip: padding-box;
}

.leaflet-div-icon.leaflet-bearingline-icon.leaflet-touch-icon {
    background: #3bdbd5;
    color: #3bdbd5;
    border-radius: 50%;
    border: 8px solid transparent;
    background-clip: padding-box;
}
.leaflet-div-icon.leaflet-bearingline-icon.leaflet-touch-icon:hover {
  border: 6px solid transparent;
}

.leaflet-div-icon.leaflet-twaline-icon.leaflet-touch-icon {
    background: #ef1780;
    color: #ef1780;
    border-radius: 50%;
    border: 8px solid transparent;
    background-clip: padding-box;
}
.leaflet-div-icon.leaflet-twaline-icon.leaflet-touch-icon:hover {
  border: 6px solid transparent;
}

.leaflet-tooltip.draw-tooltip .date {
  color: #c0d7f9;
  font-weight: bold;
}

.leaflet-tooltip.draw-tooltip .date .hour {
  float: right;
}

.leaflet-tooltip.draw-tooltip .primary {
  color: #ffffff;
}

.leaflet-tooltip.draw-tooltip .primary .sail {
  font-weight: bold;
}

.leaflet-tooltip.draw-tooltip .primary .foil {
  margin-left: 5px;
  /* float: right; */
}

.leaflet-tooltip.draw-tooltip .primary .ice {
  margin-left: 5px;
  /* float: right; */
}

.leaflet-tooltip.draw-tooltip .primary .fire {
  margin-left: 5px;
  /* float: right; */
  color: #ef1780;
}

.leaflet-tooltip.draw-tooltip .secondary {
  color: #f8d5e4;
}

.leaflet-tooltip.draw-tooltip {
    background: rgb(54, 54, 54);
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid transparent;
    -webkit-border-radius: 4px;
    border-radius: 4px;
    color: #fff;
    font: 12px/18px "Helvetica Neue", Arial, Helvetica, sans-serif;
    margin-left: 10px;
    margin-top: -21px;
    padding: 4px 8px;
    white-space: nowrap;
    z-index: 6;
    box-shadow: 0 0 0;
}

.leaflet-tooltip.draw-tooltip:before {
    border-right: 6px solid black;
    border-right-color: rgba(0, 0, 0, 0.5);
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    content: "";
    position: absolute;
    top: 22px;
}
</style>
