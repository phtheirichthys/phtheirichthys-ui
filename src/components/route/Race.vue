<script setup lang="ts">
import L from 'leaflet'

import Buoy from '../Buoy.vue'
import { useRacesStore } from '../../stores/races'
import { onMounted, ref, Ref, toRaw } from 'vue'
import { Coords, Buoy as IBuoy, Race } from '@phtheirichthys/phtheirichthys'

const props = defineProps<{
  layer: L.Map | L.LayerGroup,
  raceId: string,
  edit: boolean,
}>()

const racesStore = useRacesStore()

const race: Ref<Race> = ref(JSON.parse(JSON.stringify(toRaw(racesStore.get(props.raceId)))))

const layer = L.layerGroup()
layer.addTo(props.layer)

const iceLimitsLayer = L.layerGroup().addTo(layer)
const restrictedZonesLayer = L.layerGroup().addTo(layer)

function change(_index: number, _buoy: IBuoy) {

}

function validate(buoy: IBuoy) {
  console.log("validate", buoy, props.edit)
  if (props.edit === true) {
    return
  }
  buoy.validated = !buoy.validated
  racesStore.save(toRaw(race.value!))
}

onMounted(() => {
  drawIceLimits()
  drawRestrictedZones()
})

function drawIceLimits() {
  iceLimitsLayer.clearLayers()

  if(!race.value.ice_limits) {
    return
  }

  var latlngs = Array<[number, number]>()
  for(var n = -1 ; n <= 1 ; n++) {
    race.value.ice_limits.south.forEach((item: Coords, i: number) => {
      if (n == -1 && i == 0) {
        latlngs.push([-90, item.lon + n * 360])
      }
      latlngs.push([item.lat, item.lon + n * 360])
      if (n == 1 && i == race.value.ice_limits!.south.length - 1) {
        latlngs.push([-90, item.lon + n * 360])
      }
    })
  }
  L.polygon(latlngs, {color: 'white', weight: 1, opacity: 0.8}).addTo(iceLimitsLayer);

  latlngs = Array<[number, number]>()
  for(n = -1 ; n <= 1 ; n++) {
    race.value.ice_limits.north.forEach((item: Coords, i: number) => {
      if (n == -1 && i == 0) {
        latlngs.push([90, item.lon + n * 360])
      }
      latlngs.push([item.lat, item.lon + n * 360])
      if (n == 1 && i == race.value.ice_limits!.north.length - 1) {
        latlngs.push([90, item.lon + n * 360])
      }
    })
  }
  L.polygon(latlngs, {color: 'white', weight: 2, opacity: 0.8}).addTo(iceLimitsLayer);

}

function drawRestrictedZones() {
  restrictedZonesLayer.clearLayers()

  if(!race.value.ice_limits) {
    return
  }

  race.value.restricted_zones.forEach((rz: any) => {
    const latlngs = [[rz.vertices.map((v: Coords) => [v.lat, v.lon - 360]), rz.vertices.map((v: Coords) => [v.lat, v.lon]), rz.vertices.map((v: Coords) => [v.lat, v.lon + 360])]]
    L.polygon(latlngs, {color: rz.color || 'red', weight: 1, opacity: 0.6}).bindTooltip(rz.name).addTo(restrictedZonesLayer);
  })
}


</script>

<template>
  <Buoy v-if="race" v-for="(buoy, index) in race.buoys" :key="index" :layer="layer" :buoy="buoy" :edit="false" @validate="validate(buoy)" @change="(buoy) => change(index, buoy)"></Buoy>
</template>

<style>
</style>
