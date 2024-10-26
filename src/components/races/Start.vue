<script setup lang="ts">
import { Coords } from '@phtheirichthys/phtheirichthys'
import { onMounted, ref, watch } from 'vue'
import { dd2dms, lat2string, lon2string } from '../../lib/utils'
import L from 'leaflet'
import "leaflet-extra-markers"

const props = defineProps<{
  edit: boolean,
  startInit: Coords,
  layer: L.LayerGroup,
}>()

const emit = defineEmits(['validate', 'change'])

const start = ref(props.startInit)

const markers = ref(new Array<L.Layer>())

function draw() {
  markers.value.forEach(item => {
    item.remove()
  })
  markers.value = []

  var startMarkerIcon = L.ExtraMarkers.icon({shape: 'circle', markerColor: 'cyan' , prefix: 'fa'})

  var wrap = 0//buoy.value.wrap ? buoy.value.wrap * 360 : 0

  var m1 = L.marker([start.value.lat, start.value.lon + wrap], {icon: startMarkerIcon, draggable: props.edit, zIndexOffset: 5000})
    .on('dragend', function(event) {
      var latlng = event.target.getLatLng();

      start.value.lat = latlng.lat
      start.value.lon = latlng.lng
      emit("change", start.value)
    }).addTo(props.layer)
  markers.value.push(m1)

}

onMounted(() => {
  draw()
})

watch([() => props.startInit, () => props.edit], () => {
  start.value = props.startInit
  draw()
},
{ deep: true })

function coord(coords: Coords) {
  var lat = dd2dms(coords!.lat)
  var lon = dd2dms(coords.lon)

  return lat2string(lat) + " - " + lon2string(lon)
}

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
            </div>
            <div class="column">
              <div class="title is-4">START</div>
            </div>
          </div>
        </div>
      </div>

      <div class="content">
        <div class="columns is-gapless is-vcentered is-mobile">
          <div class="column">

            <div>
              <div>
                <span class="icon-text start"><span class="icon"><i class="fas fa-square-full" :class="{'start': props.edit, 'waypoint': !props.edit}"></i></span>
                <span>{{ coord(start) }}</span></span>
              </div>
            </div>

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
