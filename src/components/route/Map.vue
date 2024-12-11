<script setup lang="ts">
import L from 'leaflet'
import 'leaflet-providers'
import 'leaflet-sidebar-v2'
import Boat from './Boat.vue'
import Graticule from './Graticule.vue'
import Snake from './Snake.vue'
import Race from './Race.vue'
import Land from '../Land.vue'
import Wind from '../Wind.vue'
import Route from './Route.vue'
import PreviousRoutes from './PreviousRoutes.vue'
import NavigationConfig from './NavigationConfig.vue'
import Polar from './Polar.vue'
import Table from './Table.vue'

import { ref, onMounted, onBeforeMount, watch, computed } from 'vue'
import { Point } from '../../lib/position';
import { useRouteStore } from '../../stores/route'
import { useNavigateStore } from '../../stores/navigate'
import * as phtheirichthys from '../../lib/phtheirichthys'
import { useRacesStore } from '../../stores/races'
import * as utils from '../../lib/utils'
import { useWindStore } from '../../stores/wind'
import { Wind as InstantWind } from '@phtheirichthys/phtheirichthys'

const props = defineProps<{
  boat: string,
  race: string,
}>()

const sidebarContent = ref(null)

const ready = ref(false)

const navigateStore = useNavigateStore()
const routeStore = useRouteStore()
const racesStore = useRacesStore()
const windStore = useWindStore()

const polarId = ref(racesStore.get(props.race)?.boat || null)


watch(() => props.race, () => {
  polarId.value = racesStore.get(props.race)?.boat || null
  console.log("polar ID", polarId)
})

phtheirichthys.isLoaded().then(() => {
  console.log("Phtheirichthys is ready !")
  ready.value = true
})

const navigating = ref(false)

var legend = ref(L.DomUtil.create("div", "leaflet-control-velocity"))
legend.value.setAttribute("id", "legend")

const map = new L.Map("map", {zoomControl: true, worldCopyJump: false})
const layerControl = L.control.layers()
const landLayerControl = L.layerGroup()

var wind = ref<InstantWind | null>(null)
var cursor = ref<Point | null>(null)

onBeforeMount(() => {
  navigateStore.load(props.boat, props.race)
  routeStore.load()

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

  map.setView(navigateStore.panZoom.pan, navigateStore.panZoom.zoom)
})

onMounted(() => {
  map.whenReady(() => {

    var imagery = L.tileLayer.provider('CartoDB.PositronNoLabels').addTo(map)
    layerControl.addBaseLayer(imagery, "Standard");
    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
    layerControl.addBaseLayer(osm, "OSM")
    layerControl.addTo(map)

    layerControl.addOverlay(landLayerControl, "<i class='fas fa-globe-europe'></i> Land");

    map.on("mousemove", (event) => {
      let latlng = map.containerPointToLatLng(L.point(event.containerPoint.x, event.containerPoint.y))
      onMouseMove(Point.fromLatLng(latlng))
    })

    map.on("zoomend", () => {
      navigateStore.setPanZoom([map.getCenter().lat, map.getCenter().lng], map.getZoom())
    })
    map.on("moveend", () => {
      navigateStore.setPanZoom([map.getCenter().lat, map.getCenter().lng], map.getZoom())
    })

    L.control.sidebar({
      autopan: false,       // whether to maintain the centered map point when opening the sidebar
      closeButton: true,    // whether t add a close button to the panes
      container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
      position: 'left',     // left or right
    })
    .on("content", (e: any) => {
      if (e.id == "table") {
        if (!L.DomUtil.hasClass(e.target._container, 'extended')) {
          console.log("add extended class")
          L.DomUtil.addClass(e.target._container, 'extended')
        }
      }
      sidebar.value = e.id
    })
    .on("closing", (e: any) => {
      if (L.DomUtil.hasClass(e.target._container, 'extended')) {
        console.log("remove extended class")
        L.DomUtil.removeClass(e.target._container, 'extended')
      }
      sidebar.value = null
    })
    .addTo(map);

  })
})

function onMouseMove(point: Point) {
  windStore.getWind(point, windStore.now).then((w) => {
    wind.value = w
  })
  cursor.value = point
}

function center() {
  map.flyTo([navigateStore.position.lat, navigateStore.position.lon])
}

function centerAndZoom() {
  map.flyTo([navigateStore.position.lat, navigateStore.position.lon], map.getZoom() + 2)
}

function pan() {

  let box = racesStore.box(props.race)
  box.add(navigateStore.position)

  map.flyToBounds([[box.top || 0, box.left || 0], [box.bottom || 0, box.right || 0]])
}

function navigate() {
  if (!ready.value) {
    return
  }

  navigating.value = true

  routeStore.navigate(props.race).finally(() => {
    navigating.value = false
  })
}

function test_webgpu() {
  phtheirichthys.test_webgpu().then(() => {
    console.log("test ok")
  }).catch((e) => {
    console.error("Error testing GPU", e)
  })
}

const sidebar = ref<String | null>(null)
const sidebarContentWidth = ref(0)
const sidebarContentHeight = ref(0)

onMounted(() => {
  if (!sidebarContent.value) return
  let element = sidebarContent.value as Element
  sidebarContentWidth.value = element.clientWidth
  sidebarContentHeight.value = element.clientHeight
  new ResizeObserver((sidebarContent) => {
    if (sidebar.value == "polars") {
      sidebarContentWidth.value = sidebarContent[0].contentRect.width
      sidebarContentHeight.value = sidebarContent[0].contentRect.height
    }
  }).observe(sidebarContent.value)
})

const sail = computed(() => {

  return utils.sail_name(navigateStore.settings.sail)
})

function opacity(v: number) {
  let val = 255 * v / 100
  return {
    opacity: `${val}%`
  }
}

</script>

<template>
  <Boat :layer="map" />
  <Graticule :layer="map" />
  <Snake v-if="ready && polarId" :polarId="polarId" :map="map" :layer-control="layerControl" />
  <Land v-if="ready" :layer="landLayerControl" />
  <Wind v-if="ready" :map="map" :layer-control="layerControl" />
  <Route :map="map" :layer-control="layerControl" />

  <div id="sidebar" class="leaflet-sidebar collapsed">
    <!-- Nav tabs -->
    <div class="leaflet-sidebar-tabs">
      <ul role="tablist"> <!-- top aligned tabs -->
        <li><a href="#home" role="tab"><i class="fa fa-bars"></i></a></li>
        <li><a role="tab" @click="center" @dblclick.stop="centerAndZoom"><i class="fa fa-dot-circle"></i></a></li>
        <li><a role="tab" @click="pan"><i class="fa fa-expand"></i></a></li>
        <li v-if="!ready"><a class="button" disabled><i class="fa-solid fa-fish"></i></a></li>
        <li v-if="ready"><a @click="navigate" class="button" :class="{'is-loading':navigating}"><i class="fa-solid fa-fish"></i></a></li>
        <li><a @click="test_webgpu" class="button">WebGPU</a></li>
      </ul>

      <ul role="tablist"> <!-- bottom aligned tabs -->
        <li><a href="#table" role="tab"><i class="fa fa-table"></i></a></li>
        <li class="bottom"><a href="#previous" role="tab"><i class="fas fa-list-check"></i></a></li>
        <li class="bottom"><a href="#polars" role="tab"><i class="fas fa-chart-area"></i></a></li>
        <li class="bottom"><a href="#race" role="tab"><i class="fas fa-map-marked"></i></a></li>
        <li class="bottom"><RouterLink to="/"><i class="fas fa-home"></i></RouterLink></li>
      </ul>
    </div>

    <!-- Tab panes -->
    <div ref="sidebarContent" class="leaflet-sidebar-content">
      <div class="leaflet-sidebar-pane" id="home">
        <NavigationConfig />
      </div>
      <div class="leaflet-sidebar-pane" id="table">
        <Table :display="sidebar == 'table'" />
      </div>
      <div class="leaflet-sidebar-pane" id="previous">
        <PreviousRoutes :map="map" :layer-control="layerControl" />
      </div>
      <div class="leaflet-sidebar-pane" id="polars">
        <Polar v-if="polarId" :polarId="polarId" :parentWidth="sidebarContentWidth" :parentHeight="sidebarContentHeight" />
      </div>
      <div class="leaflet-sidebar-pane" id="race">
        <Race :layer="map" :raceId="props.race" :edit="false" />
      </div>
    </div>  
  </div>
  <Teleport to="#legend">
  <div>
    <div>
      <span><strong><i class='fa fa-compass'></i></strong> {{ utils.heading(navigateStore.settings.heading, navigateStore.status.wind.direction).toFixed(1) }}</span>
      <span style="padding-left:7px;"><strong><i class='fa fa-location-arrow'></i></strong> {{ utils.twa(navigateStore.settings.heading, navigateStore.status.wind.direction).toFixed(1) }}°</span>
      <span class="sail" style="padding-left:7px;">{{ sail }}</span>
      <!-- <span v-if="navigateStore.status.ice" class='ice'><i class='fas fa-igloo'></i></span> -->
      <span v-if="navigateStore.status.foil > 0" class='foil' :style='opacity(navigateStore.status.foil)'><i class='fa fa-fighter-jet'></i></span>
      <span v-if="navigateStore.status.boost > 0" class='foil' :style='opacity(navigateStore.status.boost)'><i class='fa fa-rocket'></i></span>
    </div>
    <div>
      <span><i class='fa fa-wind'></i> {{ navigateStore.status.wind.direction.toFixed(1) }}° {{ navigateStore.status.wind.speed.toFixed(1) }}kt</span>
      <span style="padding-left:7px;"><i class='fa fa-ship'></i> {{ navigateStore.status.boat_speed.toFixed(1) }}kt</span>
    </div>
<!-- 
  if(wayPosition.status.ice) {
    primary += "<span class='ice'><i class='fas fa-igloo'></i></span>"
  } else if(wayPosition.status.foil > 0) {
  //   //primary += "<span class='foil' style='color:rgb(255," + 255 * (wl.foil / 100) + "," + 255 * (wl.foil / 100) + ");'><i class='fa fa-fighter-jet'></i></span>"
    primary += "<span class='foil' style='opacity:" + (wayPosition.status.foil) + "%;'><i class='fa fa-fighter-jet'></i></span>"
  }
  if(wayPosition.status.boost > 0) {
    primary += "<span class='foil' style='opacity:" + (wayPosition.status.boost) + "%;'><i class='fa-solid fa-rocket'></i></span>"
  }
  const secondary = "<i class='fa fa-wind'></i> " + wayPosition.status.wind.direction.toFixed(1) + "° " + wayPosition.status.wind.speed.toFixed(1) + "kt <i class='fa fa-ship'></i> " + wayPosition.status.boat_speed.toFixed(1) + "kt";

  var res = '<div class="date"><span>' + d + '</span><span class="hour">' + hrs + ":" + min + '</span></div><div class="primary">' + primary + '</div>'
  if(secondary)
    res += '<div class="secondary">' + secondary + '</div>'; -->



    <div v-if="wind || cursor" style="border-top:2px solid #ccc;">
      <div v-if="cursor">{{ utils.lat2string(utils.dd2dms(cursor.lat)) + " - " + utils.lon2string(utils.dd2dms(cursor.lon)) }}</div>
      <div v-if="wind"><strong><i class='fa fa-wind'></i></strong> {{ wind.direction.toFixed(1) + "° " + wind.speed.toFixed(1) }}kt</div>
    </div>
  </div>
  </Teleport>
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


.sail {
  font-weight: bold;
}

.foil {
  float: right;
}

</style>

<style>
.leaflet-control-velocity {
  background-color:hsla(0,0%,100%,.7);
  padding:0 5px;
  margin:0!important;
  color:#333;
  font:11px/1.5 Helvetica Neue,Arial,Helvetica,sans-serif;
	box-shadow: 0 1px 5px rgba(0,0,0,0.4) !important;
	background: #fff !important;
	border-radius: 5px !important;
  font: 12px/1.5 "Helvetica Neue", Arial, Helvetica, sans-serif !important;
}

.leaflet-touch .leaflet-control-velocity {
	box-shadow: none  !important;
}
.leaflet-touch .leaflet-control-velocity {
	border: 2px solid rgba(0,0,0,0.2) !important;
	background-clip: padding-box !important;
}
.leaflet-left .leaflet-control-velocity {
	margin-left: 10px !important;
}
.leaflet-top .leaflet-control-velocity {
	margin-top: 10px !important;
}
.leaflet-bottom .leaflet-control-velocity {
  margin-bottom: 10px !important;
}

</style>
