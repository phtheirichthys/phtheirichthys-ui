<script setup lang="ts">
import L from 'leaflet'

import Buoy from '../Buoy.vue'
import { useRacesStore } from '../../stores/races';
import { ref } from 'vue';

const props = defineProps<{
  layer: L.Map | L.LayerGroup,
  raceId: string
}>()

const racesStore = useRacesStore()

const race = ref(racesStore.get(props.raceId))


const layer = L.layerGroup()
layer.addTo(props.layer)

</script>

<template>
    <Buoy v-if="race" v-for="(buoy, index) in race.buoys" :key="index" :layer="layer" :buoy="buoy" :edit="false"></Buoy>
</template>

<style>
</style>
