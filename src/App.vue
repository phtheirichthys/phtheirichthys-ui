<script setup lang="ts">
import { onBeforeUnmount, onBeforeMount } from 'vue';
import { PhtheitichthysService, emitter } from './lib/phtheirichthys';
import { PolarService } from './lib/polars';

emitter.on("wind-provider-status", (status) => {
  console.log("Event Wind Status", status)
})

onBeforeMount(() => {
  setTimeout(() => {
    PhtheitichthysService.start()

    PolarService.init()
  }, 1000)
})

onBeforeUnmount(() => {
  PhtheitichthysService.terminate()
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
