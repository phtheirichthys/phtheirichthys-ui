<script setup lang="ts">
import { Buoy, Coords, Door } from '@phtheirichthys/phtheirichthys'
import { computed, onMounted, ref, watch } from 'vue'
import { Utils } from '../lib/utils'
import L from 'leaflet'
import "leaflet-extra-markers"

const props = defineProps<{
  edit: boolean | false,
  buoy: Buoy,
  layer: L.LayerGroup,
}>()

const emit = defineEmits(['validate'])

const buoy = ref(props.buoy)
const type = ref(buoy.value.type)

const markers = ref(new Array<L.Layer>())

const colorClassLeft = computed(() => {
  return {
    'zone': buoy.value.type === 'Zone',
    'waypoint': buoy.value.type === 'Waypoint',
    'door-left': buoy.value.type === 'Door' && true,
    'door-right': buoy.value.type === 'Door' && false,
    'validated': buoy.value.validated,
  }
})

const colorClassRight = computed(() => {
  return {
    'zone': buoy.value.type === 'Zone',
    'waypoint': buoy.value.type === 'Waypoint',
    'door-left': buoy.value.type === 'Door' && false,
    'door-right': buoy.value.type === 'Door' && true,
    'validated': buoy.value.validated,
  }
})

function coord(coords: Coords) {
  var lat = Utils.dd2dms(coords!.lat)
  var lon = Utils.dd2dms(coords.lon)

  return Utils.lat2string(lat) + " - " + Utils.lon2string(lon)
}

function reverse() {
  let door = buoy.value as Door
  
  let starboard = door.starboard
  door.starboard = door.port
  door.port = starboard
}

function changeType() {
  console.log(buoy.value.type, "->", type.value)
  switch (buoy.value.type) {
    case "Door":
      switch (type.value) {
        case "Door":
          break
        case "Waypoint":
          buoy.value = {
            type: "Waypoint",
            name: buoy.value.name,
            destination: buoy.value.port,
            to_avoid: buoy.value.to_avoid,
            validated: buoy.value.validated,
          }
          break
        case "Zone":
          buoy.value = {
            type: "Zone",
            name: buoy.value.name,
            destination: buoy.value.port,
            radius: 5,
            to_avoid: buoy.value.to_avoid,
            validated: buoy.value.validated,
          }
          break
      }
      break
    case "Waypoint":
      switch (type.value) {
        case "Door":
          buoy.value = {
            type: "Door",
            name: buoy.value.name,
            port: buoy.value.destination,
            starboard: buoy.value.destination,
            departure: buoy.value.destination,
            destination: buoy.value.destination,
            to_avoid: buoy.value.to_avoid,
            validated: buoy.value.validated,
          }
          break
        case "Waypoint":
          break
        case "Zone":
          buoy.value = {
            type: "Zone",
            name: buoy.value.name,
            destination: buoy.value.destination,
            radius: 5,
            to_avoid: buoy.value.to_avoid,
            validated: buoy.value.validated,
          }
          break
      }
      break
    case "Zone":
      switch (type.value) {
        case "Door":
          buoy.value = {
            type: "Door",
            name: buoy.value.name,
            port: buoy.value.destination,
            starboard: buoy.value.destination,
            departure: buoy.value.destination,
            destination: buoy.value.destination,
            to_avoid: buoy.value.to_avoid,
            validated: buoy.value.validated,
          }
          break
        case "Waypoint":
          buoy.value = {
            type: "Waypoint",
            name: buoy.value.name,
            destination: buoy.value.destination,
            to_avoid: buoy.value.to_avoid,
            validated: buoy.value.validated,
          }
          break
        case "Zone":
          break
      }
      break
  }
}

function redraw() {
  markers.value.forEach(item => {
    item.remove()
  })
  markers.value = []
  drawBuoy()
}

function drawBuoy() {
  //var startMarkerIcon = L.ExtraMarkers.icon({shape: 'circle', markerColor: 'cyan' , prefix: 'fa'})
  var markerIcon = L.ExtraMarkers.icon({icon: 'fa-number', number: buoy.value.name, shape: 'penta', markerColor: buoy.value.validated === true ? 'cyan' : 'yellow'});
  var markerIconPort = L.ExtraMarkers.icon({icon: 'fa-number', number: buoy.value.name, shape: 'penta', markerColor: buoy.value.validated === true ? 'cyan' : 'red'});
  var markerIconStarboard = L.ExtraMarkers.icon({icon: 'fa-number', number: buoy.value.name, shape: 'penta', markerColor: buoy.value.validated === true ? 'cyan' : 'green'});

  var wrap = 0//buoy.value.wrap ? buoy.value.wrap * 360 : 0
  if(buoy.value.type === "Zone") {

    var endM = L.marker([buoy.value.destination.lat, buoy.value.destination.lon + wrap], {icon: markerIcon, draggable: props.edit})
      .on('click', () => {
        console.log("click", buoy.value.validated)
        buoy.value.validated = !buoy.value.validated
        emit('validate')
        console.log("click", buoy.value.validated)
      })
      .on('dragend', function(event) {
        var latlng = event.target.getLatLng();

        buoy.value.destination = {lat: latlng.lat, lon: latlng.lng}
      }).addTo(props.layer)
    markers.value.push(endM)
    var zone = L.circle(L.latLng(buoy.value.destination.lat, buoy.value.destination.lon + wrap), {radius: buoy.value.radius * 1852, color: "red", weight: 2, dashArray: [5, 8]}).addTo(props.layer);
    markers.value.push(zone)

  } else if(buoy.value.type === "Waypoint") {

    var m1 = L.marker([buoy.value.destination.lat, buoy.value.destination.lon + wrap], {icon: markerIcon, draggable: props.edit, zIndexOffset: 5000})
      .on('dragend', function(event) {
        var latlng = event.target.getLatLng();

        buoy.value.destination = {lat: latlng.lat, lon: latlng.lng}
      }).addTo(props.layer)
    markers.value.push(m1)

  } else if(buoy.value.type === "Door") {
    var line = L.polyline([[buoy.value.port.lat, buoy.value.port.lon + wrap], [buoy.value.starboard.lat, buoy.value.starboard.lon + wrap]], {color: 'red', dashArray: '4, 8', dashOffset: '0', weight: 1}).addTo(props.layer);
    markers.value.push(line)

    var m1 = L.marker([buoy.value.port.lat, buoy.value.port.lon + wrap], {icon: markerIconPort, draggable: props.edit, zIndexOffset: 5000})
      .on('dragend', function(event) {
        var latlng = event.target.getLatLng();
        let door = buoy.value as Door
        door.port = {lat: latlng.lat, lon: latlng.lng}
        line.setLatLngs([[door.port.lat, door.port.lon + wrap], [door.starboard.lat, door.starboard.lon + wrap]])
      }).addTo(props.layer)
    markers.value.push(m1)

    var m2 = L.marker([buoy.value.starboard.lat, buoy.value.starboard.lon + wrap], {icon: markerIconStarboard, draggable: props.edit, zIndexOffset: 5000})
      .on('dragend', function(event) {
        var latlng = event.target.getLatLng();
        let door = buoy.value as Door
        door.starboard = {lat: latlng.lat, lon: latlng.lng}
        line.setLatLngs([[door.port.lat, door.port.lon + wrap], [door.starboard.lat, door.starboard.lon + wrap]])
      }).addTo(props.layer)
    markers.value.push(m2)
  }  
}

onMounted(() => {
  redraw()
})

watch(buoy, () => {
  redraw()
},
{ deep: true })

</script>

<template>
  <div class="card mb-3">
    <!-- <div v-show="edit" class="dragger has-text-grey-lighter">
      <span class="icon">
        <i class="fas fa-grip-vertical"></i>
      </span>
    </div> -->
    <div class="card-content p-2" :class="{'with-dragger': edit}">
      <div class="media mb-1">
        <div class="media-content">
          <div class="columns is-gapless is-vcentered is-mobile">
            <div class="column">
              <div v-if="!edit" class="subtitle is-6">{{ buoy.type}}</div>
              <div v-if="edit" class="select is-small">
                <select v-model="type" @change="changeType">
                  <option value="Door">Door</option>
                  <option value="Zone">Zone</option>
                  <option value="Waypoint">Waypoint</option>
                </select>
              </div>
            </div>
            <div class="column">
              <div v-if="!edit" class="title is-4">{{ buoy.name }}</div>
              <input v-if="edit" v-model="buoy.name" class="input is-small" type="text">
            </div>
          </div>
        </div>
        <div class="media-right">
          <button v-show="edit" class="button is-small is-white">
            <span class="icon is-small">
              <i class="fas fa-trash"></i>
            </span>
          </button>
        </div>
      </div>

      <div class="content">
        <div class="columns is-gapless is-vcentered is-mobile">
          <div class="column">

            <div v-if="buoy.type === 'Waypoint'">
              <div>
                <span class="icon-text" :class="colorClassLeft"><span class="icon"><i class="fas fa-square-full" :class="{'start': edit, 'waypoint': !edit}"></i></span>
                <span>{{ coord(buoy.destination) }}</span></span>
              </div>
            </div>

            <div v-if="buoy.type === 'Zone'">
              <div>
                <span class="icon-text" :class="colorClassLeft"><span class="icon"><i class="fas fa-square-full" :class="{'start': edit, 'waypoint': !edit}"></i></span>
                <span>{{ coord(buoy.destination) }}</span></span>
              </div>
              <span class="icon-text">
                <span class="icon">
                  <i class="far fa-circle"></i>
                </span>
                <span v-show="!edit">{{ buoy.radius }} milles</span>
                <span v-show="edit">
                  <div class="field has-addons">
                    <p class="control">
                      <a class="button  is-small is-static">
                        NM
                      </a>
                    </p>
                    <p class="control">
                      <input v-model="buoy.radius" class="input is-small" type="text">
                    </p>
                  </div>
                </span>
              </span>
            </div>

            <div v-if="buoy.type === 'Door'">
              <div>
                <span class="icon-text" :class="colorClassLeft"><span class="icon"><i class="fas fa-square-full" :class="{'start': edit, 'waypoint': !edit}"></i></span>
                <span>{{ coord(buoy.port) }}</span></span>
              </div>
              <div>
                <span class="icon-text" :class="colorClassRight"><span class="icon"><i class="fas fa-square-full"></i></span>
                <span>{{ coord(buoy.starboard) }}</span></span>
              </div>
            </div>

          </div>
          <div class="column is-narrow">
            <button v-show="edit && buoy.type== 'Door'" class="button is-small is-white" @click="reverse()">
              <span class="icon is-small">
                <i class="fas fa-random"></i>
              </span>
            </button>
            <!-- <span class="icon"><i v-if="buoy.latlons.length > 1" class="fas fa-lg fa-random"></i></span> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.start span :first-of-type {
  color: #28a5db;
}
.validated span :first-of-type {
  color: #28a5db !important;
}
.waypoint span :first-of-type {
  color: #f5b72f;
}
.door-left span :first-of-type  {
  color: #9c272b;
}
.door-right span :first-of-type  {
  color: #008c38;
}
.zone span :first-of-type  {
  color: #ee8b1c;
}

.dragger {
  height: 100%;
  width: 20px;
  position: absolute;
  display: block;
}

.dragger span {
  height: 100%;
  width: 100%;
  cursor: grab;
}

.with-dragger {
  margin-left: 20px
}
</style>