<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import * as phtheirichthys from './lib/phtheirichthys'
import { usePolarsStore } from './stores/polars'
import { useRacesStore } from './stores/races'

phtheirichthys.emitter.on("wind-provider-status", (status) => {
  console.log("Event Wind Status", status)
})

onMounted(() => {
  phtheirichthys.init()

  usePolarsStore()
  useRacesStore()
})

onBeforeUnmount(() => {
  phtheirichthys.terminate()
})
</script>

<template>
  <router-view /> 
</template>

<style scoped>
body {
  margin: 0;
  padding: 0;
}
</style>
