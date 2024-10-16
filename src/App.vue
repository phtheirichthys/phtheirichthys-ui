<script setup lang="ts">
import { onBeforeUnmount, onBeforeMount } from 'vue';
import { PolarService } from './lib/polars';

import { usePhtheirichthysStore, emitter } from './stores/phtheirichthys'

const phtheirichthys = usePhtheirichthysStore()

emitter.on("wind-provider-status", (status) => {
  console.log("Event Wind Status", status)
})

onBeforeMount(() => {
  setTimeout(() => {
    phtheirichthys.init()

    PolarService.init()
  }, 10000)
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
