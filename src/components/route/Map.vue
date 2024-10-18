<script setup lang="ts">
import L from 'leaflet'
import 'leaflet-providers'
import 'leaflet-sidebar-v2'
import Boat from './Boat.vue'
import Graticule from './Graticule.vue'
import Snake from './Snake.vue'
import Race from './Race.vue'
import Land from '../Land.vue'
import Route from './Route.vue'

import { ref, onMounted, Ref, toRaw } from 'vue'
import { Wind } from '../../lib/wind';
import { BoatConfig, Point } from '../../lib/position';
import type { RouteResult } from '@phtheirichthys/phtheirichthys/phtheirichthys'

import * as phtheirichthys from '../../lib/phtheirichthys'

const props = defineProps<{
  boat: string,
  race: string,
}>()

const routeResult: Ref<RouteResult | null> = ref(null)

const boat: Ref<BoatConfig> = ref(new BoatConfig())

const navigating = ref(false)

var legend = ref(L.DomUtil.create("div"))

const map = new L.Map("map", {zoomControl: true, worldCopyJump: false}).setView([0, 0], 4)
const layerControl = L.control.layers()
const landLayerControl = L.layerGroup()

var wind: Ref<Wind | null> = ref(null)

onMounted(() => {
  map.whenReady(() => {

    var imagery = L.tileLayer.provider('CartoDB.PositronNoLabels').addTo(map)
    layerControl.addBaseLayer(imagery, "Standard");
    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
    layerControl.addBaseLayer(osm, "OSM")
    layerControl.addTo(map)

    layerControl.addOverlay(landLayerControl, "<i class='fas fa-globe-europe'></i> Land");

    let VelocityControl = L.Control.extend({
      onAdd: function() {
        return legend.value
      },
      onRemove: function() {
      },
    })
    let velocityControl = new VelocityControl()
    velocityControl.setPosition("bottomleft")
    velocityControl.addTo(map)

    map.on("mousemove", (event) => {
      let latlng = map.containerPointToLatLng(L.point(event.containerPoint.x, event.containerPoint.y))
      onMouseMove(Point.fromLatLng(latlng))
    })

    L.control.sidebar({
      autopan: false,       // whether to maintain the centered map point when opening the sidebar
      closeButton: true,    // whether t add a close button to the panes
      container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
      position: 'left',     // left or right
    }).addTo(map);

  })
})

function onMouseMove(point: Point) {
  try {
    phtheirichthys.get_wind(point).then((w) => {
      wind.value = w
    })
    displayLegend()
  } catch (e) {

  }
}

function displayLegend() {
  //const pad = (num: number, places: number) => String(num).padStart(places, '0')
  if (legend.value) {
    var leg = ""
    // if (this.snake) {
    //   leg += "<div><strong><i class='fa fa-compass'></i></strong> " + this.snake.bearing + "° <strong><i class='fa fa-location-arrow'></i></strong> " + this.snake.twa.toFixed(1) + "°<div>"
    // }
    if (wind.value) {
      leg += "<div><strong><i class='fa fa-wind'></i> </strong>" + wind.value.direction.toFixed(1) + "° " + wind.value.speed.toFixed(1) + "kt</div>"
    }
    // if (this.cursor) {
    //   var lat = this.convertDDToDMS(this.cursor.lat)
    //   var lon = this.convertDDToDMS(this.cursor.lng)
    //   leg += "<div>" + pad(lat.d, 2) + "°" + (lat.p < 0 ? "S" : "N") + " " + pad(lat.m, 2) + "'" + pad(lat.s.toFixed(0), 2) + "\" - " + pad(lon.d, 2) + "°" + (lon.p < 0 ? "W" : "E") + " " + pad(lon.m, 2) + "'" + pad(lon.s.toFixed(0), 2) + "\"</div>"
    // }
    legend.value.innerHTML = leg
  }
}

function center() {
  map.flyTo(boat.value.position.toLatLng())
}

function centerAndZoom() {
  map.flyTo(boat.value.position.toLatLng(), map.getZoom() + 2)
}

function pan() {

}

function navigate() {
  navigating.value = true
  phtheirichthys.navigate(props.race, toRaw(boat.value)).then((res) => {
    console.log(routeResult)
    routeResult.value = res
  }).finally(() => {
    navigating.value = false
  })
}

function test_webgpu() {
  phtheirichthys.test_webgpu()
}

</script>

<template>
  <Boat :boat="boat" :layer="map" />
  <Graticule :layer="map" />
  <Snake :map="map" :layer-control="layerControl" />
  <Land :layer="landLayerControl" />
  <Route v-if="routeResult" :layer="map" :route="routeResult" />

  <div id="sidebar" class="leaflet-sidebar collapsed">
    <!-- Nav tabs -->
    <div class="leaflet-sidebar-tabs">
      <ul role="tablist"> <!-- top aligned tabs -->
        <li><a href="#home" role="tab"><i class="fa fa-bars"></i></a></li>
        <li><a role="tab" @click="center" @dblclick.stop="centerAndZoom"><i class="fa fa-dot-circle"></i></a></li>
        <li><a role="tab" @click="pan"><i class="fa fa-expand"></i></a></li>
        <li><a @click="navigate" class="button" :class="{'is-loading':navigating}"><i class="fa-solid fa-fish"></i></a></li>
        <li><a @click="test_webgpu" class="button">WebGPU</a></li>
      </ul>

      <ul role="tablist"> <!-- bottom aligned tabs -->
        <li><a href="#table" role="tab"><i class="fa fa-table"></i></a></li>
        <li class="bottom"><a href="#polars" role="tab"><i class="fas fa-chart-area"></i></a></li>
        <li class="bottom"><a href="#race" role="tab"><i class="fas fa-map-marked"></i></a></li>
        <li class="bottom"><a href="#boats" role="tab"><i class="fa fa-ship"></i></a></li>
        <li class="bottom"><a href="#settings" role="tab"><i class="fas fa-cog"></i></a></li>
      </ul>
    </div>

    <!-- Tab panes -->
    <div class="leaflet-sidebar-content">
      <div class="leaflet-sidebar-pane" id="home">
      </div>
      <div class="leaflet-sidebar-pane" id="polars">
      </div>
      <div class="leaflet-sidebar-pane" id="race">
        <Race :layer="map" :raceId="props.race" />
      </div>
    </div>  
  </div>
</template>

<style scoped>
@media (max-height: 460px) {
  .bottom {
    visibility: hidden;
    height: 0px;
  }
}

@media (min-width: 768px) {
  .leaflet-sidebar-left ~ .notification {
    transition: left 500ms;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .leaflet-sidebar-left.extended ~ .leaflet-control-container .leaflet-left {
    left: 400px;
  }
  .leaflet-sidebar-left.extended ~ .notification {
    left: 456px;
  }
  .leaflet-sidebar-left ~ .notification {
    left: 371px;
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .leaflet-sidebar-left.extended ~ .leaflet-control-container .leaflet-left {
    left: 600px;
  }
  .leaflet-sidebar-left.extended ~ .notification {
    left: 656px;
  }
  .leaflet-sidebar-left ~ .notification {
    left: 456px;
  }
}

@media (min-width: 1200px) {
  .leaflet-sidebar-left.extended ~ .leaflet-control-container .leaflet-left {
    left: 900px;
  }
  .leaflet-sidebar-left.extended ~ .notification {
    left: 956px;
  }
  .leaflet-sidebar-left ~ .notification {
    left: 556px;
  }
}

.leaflet-sidebar-left.collapsed ~ .notification {
  left: 106px;
}

@media (min-width: 768px) {
  .leaflet-sidebar.extended {
    top: 10px;
    bottom: 10px;
    transition: width 500ms; } }
@media (min-width: 768px) and (max-width: 991px) {
  .leaflet-sidebar.extended {
    width: 390px;
    max-width: 390px; } }
@media (min-width: 992px) and (max-width: 1199px) {
  .leaflet-sidebar.extended {
    width: 590px;
    max-width: 590px; } }
@media (min-width: 1200px) {
  .leaflet-sidebar.extended {
    width: 890px;
    max-width: 890px; } }

.leaflet-sidebar-tabs .button {
  padding: 0px;
  border: 0px;
}

.leaflet-sidebar-pane .section {
  padding: 10px 0px 0px;
}

.leaflet-control-scale.leaflet-control {
  margin-left: 25px;
}

.leaflet-sidebar-tabs > li.active, .leaflet-sidebar-tabs > ul > li.on,
.leaflet-sidebar-tabs > li.active, .leaflet-sidebar-tabs > ul > li.on:hover {
  color: #0074d9;
}
</style>
