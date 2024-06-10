<script setup lang="ts">
import { ref } from 'vue';
import Map from './route/Map.vue'

const props = defineProps<{
  boat: string,
  race: string,
}>()

const map = ref(null)

</script>

<template>
  <div id="map" ref="map">
    <Map v-if="map" :boat="props.boat" :race="props.race" />
  </div>
</template>

<style scoped>
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
}
</style>