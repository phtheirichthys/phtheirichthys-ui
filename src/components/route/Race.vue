<script setup lang="ts">
import L from 'leaflet'

import Buoy from '../Buoy.vue'
import { useRacesStore } from '../../stores/races'
import { ref } from 'vue'
import { Buoy as IBuoy } from '@phtheirichthys/phtheirichthys'

const props = defineProps<{
  layer: L.Map | L.LayerGroup,
  raceId: string
}>()

const racesStore = useRacesStore()

const race = ref(racesStore.get(props.raceId))


const layer = L.layerGroup()
layer.addTo(props.layer)

function change(_index: number, _buoy: IBuoy) {

}

</script>

<template>
    <Buoy v-if="race" v-for="(buoy, index) in race.buoys" :key="index" :layer="layer" :buoy="buoy" :edit="false" @change="(buoy) => change(index, buoy)"></Buoy>
</template>

<style>
</style>
