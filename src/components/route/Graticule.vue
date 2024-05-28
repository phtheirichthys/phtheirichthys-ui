<template>
  <div></div>
</template>
  
<script setup lang="ts">
import L from 'leaflet'
import 'leaflet-graticule'
import { onMounted } from 'vue';
  
const props = defineProps<{
  layer: L.Map | L.LayerGroup,
}>()

onMounted(() => {
  L.latlngGraticule({
    showLabel: true,
    color: '#fff',
    weight: 0.5,
    opacity: 0.5,
    dashArray: '1,1',
    zoomInterval: [
      {start: 1, end: 3, interval: 10},
      {start: 4, end: 7, interval: 5},
      {start: 8, end: 20, interval: 1}
    ]
  }).addTo(props.layer)
})
</script>