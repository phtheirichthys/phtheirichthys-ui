<template>
  <div></div>
</template>
  
<script setup lang="ts">
import L from 'leaflet'
import AutoGraticule from "leaflet-auto-graticule"
import { onMounted } from 'vue';
  
const props = defineProps<{
  layer: L.Map | L.LayerGroup,
}>()

onMounted(() => {
  new AutoGraticule().addTo(props.layer)
})
</script>