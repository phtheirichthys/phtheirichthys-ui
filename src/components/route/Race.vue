<script setup lang="ts">
import L from 'leaflet'

import Buoy from '../Buoy.vue'
import { useRacesStore } from '../../stores/races'
import { ref, toRaw } from 'vue'
import { Buoy as IBuoy } from '@phtheirichthys/phtheirichthys'

const props = defineProps<{
  layer: L.Map | L.LayerGroup,
  raceId: string,
  edit: boolean,
}>()

const racesStore = useRacesStore()

const race = ref(JSON.parse(JSON.stringify(toRaw(racesStore.get(props.raceId)))))


const layer = L.layerGroup()
layer.addTo(props.layer)

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

</script>

<template>
  <Buoy v-if="race" v-for="(buoy, index) in race.buoys" :key="index" :layer="layer" :buoy="buoy" :edit="false" @validate="validate(buoy)" @change="(buoy) => change(index, buoy)"></Buoy>
</template>

<style>
</style>
