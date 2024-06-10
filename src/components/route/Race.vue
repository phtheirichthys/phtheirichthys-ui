<script setup lang="ts">
import L from 'leaflet'
import { Race } from '@phtheirichthys/phtheirichthys';

import Buoy from '../Buoy.vue'
import { RaceService } from '../../lib/races';
import { ref } from 'vue';

var marker: L.Marker;

const props = defineProps<{
  layer: L.Map | L.LayerGroup,
  raceId: string
}>()

const race = ref(RaceService.get(props.raceId))


const layer = L.layerGroup()
layer.addTo(props.layer)

</script>

<template>
    <Buoy v-for="(buoy, index) in race.buoys" :key="index" :layer="layer" :buoy="buoy" :edit="false"></Buoy>
</template>

<style>
</style>