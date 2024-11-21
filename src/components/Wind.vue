<script setup lang="ts">
import L from 'leaflet'
import { computed, onBeforeMount, onMounted, ref } from 'vue';

import { useWindStore, emitter as windEmitter } from '../stores/wind';

const props = defineProps<{
    map: L.Map,
    layerControl: L.Control.Layers
}>()

const windStore = useWindStore()

windEmitter.on("select", (date) => select(date))

const now = ref(new Date())
now.value.setSeconds(0)
now.value.setMilliseconds(0)
now.value.setMinutes(now.value.getMinutes() - now.value.getMinutes()%10 + 10)

const selected_date = ref(now.value)

const colapsed = ref(true)

const windLayerControl = L.layerGroup()
var legend = ref(L.DomUtil.create("div", "leaflet-control-layers leaflet-control"))
legend.value.setAttribute("id", "wind-control")

onBeforeMount(() => {
  let VelocityControl = L.Control.extend({
    onAdd: function() {
      return legend.value
    },
    onRemove: function() {
    },
  })
  let velocityControl = new VelocityControl()
  velocityControl.setPosition("topright")
  velocityControl.addTo(props.map)
})

let WindLayer = L.GridLayer.extend({
  options: {
      opacity: 0.6,
      zIndex: 10
  },
  initialize: function(options: any) {
      L.setOptions(this, options);
  },
  createTile: function (coords: L.Coords) {

      // create a <canvas> element for drawing
      var tile = L.DomUtil.create('canvas', 'leaflet-tile');
      // setup tile width and height according to the options
      var size = this.getTileSize();
      tile.width = size.x;
      tile.height = size.y;

      const offscreen = tile.transferControlToOffscreen()
      // const ctx = offscreen.getContext('2d');

      // draw something asynchronously and pass the tile to the done() callback
      windStore.drawWind(offscreen, selected_date.value, coords.x, coords.y, coords.z, size.x, size.y)

      return tile;
  },
})

const windLayer = new WindLayer()

onMounted(() => {

  windStore.isReady.then(() => {
    props.layerControl.addOverlay(windLayerControl, "<i class='fas fa-globe-europe'></i> Wind");
  })

  windLayer.addTo(windLayerControl)
})

const refTimes = computed(() => {
  const forecasts = [0, 1, 2, 3, 4, 5, 6, 9, 12, 24, 36, 48, 72, 96, 120, 144, 168]
  let f = 0
  let f_date = new Date(now.value)
  f_date.setHours(f_date.getHours() + forecasts[f])

  let res = new Array<any>()
  if (!windStore.status) return res

  let prev: string | null = null
  windStore.status.forecasts.forEach((references: any[], forecast: string | number | Date) => {
    let ref = references.map((r) => new Date(r).getUTCHours().toString().padStart(2, "0") + "Z").join("-")
    if (ref !== prev) {
      prev = ref

      if (res.length > 0) {
        let forecast_time = new Date(forecast)
        while (f_date < forecast_time) {
          res[res.length - 1].forecasts.push({forecast: forecasts[f], date: f_date, display: display(forecasts[f])})
          f += 1
          f_date = new Date(now.value)
          f_date.setHours(f_date.getHours() + forecasts[f])
        }
      }

      res.push({
        refTime: ref,
        files: references.map((r) => new Date(r).getUTCHours().toString().padStart(2, "0") + "." + ((new Date(forecast).getTime() - new Date(r).getTime()) / (1000 * 60 * 60)).toString().padStart(3, "0") + "Z"),
        forecasts: []
      })
    } else {
      references.forEach((r) => {
        res[res.length - 1].files.push(new Date(r).getUTCHours().toString().padStart(2, "0") + "." + ((new Date(forecast).getTime() - new Date(r).getTime()) / (1000 * 60 * 60)).toString().padStart(3, "0") + "Z")
      })
    }
  })

  for (let i = f; i < forecasts.length ; i++) {
    f_date = new Date(now.value)
    f_date.setHours(f_date.getHours() + forecasts[i])

    res[res.length - 1].forecasts.push({forecast: forecasts[i], date: f_date, display: display(forecasts[i])})
  }

  return res
})

function display(h: number) {
  if (h == 0) {
    return now.value.getHours() + ":" + now.value.getMinutes().toString().padStart(2, "0")
  }
  if (h <= 48) {
    return " + " + h + "h "
  } else {
    return h % 24 == 0 ? " + " + Math.round(h/24) + "j " : " + " + Math.round(h/24) + "j " + h + "h "
  }
}

function select(forecast_date: Date) {
  selected_date.value = forecast_date
  windLayer.redraw()
}

</script>

<template>
  <Teleport to="#wind-control">
    <div v-if="windStore.status" class="forecast-times" :class="{expanded: !colapsed}">
      <div v-show="!colapsed" class="has-text-centered is-clickable" @click="colapsed = !colapsed">
        <i class="fas fa-caret-up"></i>
      </div>
      <div class="button is-small is-fullwidth is-white p-0">
        <div><i class="fas fa-wind"></i><span style="padding-left:5px">{{ windStore.provider }}</span></div>
      </div>
      <div v-for="r in refTimes" :key="r.refTime" class="m-0 is-gapless" :class="{'ref': !colapsed}">
        <div v-show="!colapsed" class="p-0 has-text-centered has-text-weight-bold ref-time has-tooltip-left has-tooltipl-multiline" :data-tooltip='r.files.join("\n")' >
          {{ r.refTime }}
        </div>
        <div class="is-clickable is-unselectable">
          <div v-show="!colapsed || forecast.forecast == 0" v-for="forecast in r.forecasts" :key="forecast" @click="select(forecast.date)" class="p-0 has-text-centered" :class="{'selected': forecast.date == selected_date}">
            {{ forecast.display }}
          </div>
        </div>
      </div>
      <div class="button is-small is-fullwidth is-white p-0"></div>
      <div v-show="colapsed" class="has-text-centered is-clickable" @click="colapsed = !colapsed">
        <i class="fas fa-caret-down"></i>
      </div>
    </div>
  </Teleport>
</template>

<style>
div.leaflet-top.leaflet-right {
    height: 100%;
    display: flex;
    flex-flow: column;
}

div.leaflet-control-layers.leaflet-control.forecast-times.expanded {
  overflow-y: scroll;
}

div.leaflet-control-layers.leaflet-control.forecast-times {
    margin-bottom: 10px;
    -webkit-overflow-scrolling: touch;
    z-index: 25;
}

.ref {
  border-top: 1px solid #ccc;
  white-space: nowrap;
  margin-right: 2px;
}

.ref-time {
    background-color: #ccc;
    opacity: 0.5;
    /*writing-mode: sideways-lr;*/
}

.selected {
    color: #fff;
    background-color: #3388ff;
    opacity: 0.5;
}

left::before, [data-tooltip]:not([disabled]).has-tooltip-left::before {
  bottom: 15px;
  transform: translate(-100%,100%);
}
</style>
