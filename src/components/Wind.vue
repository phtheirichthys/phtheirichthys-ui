<script setup lang="ts">
import L from 'leaflet'
import { computed, onBeforeMount, onMounted, ref } from 'vue';

import { useWindStore } from '../stores/wind';

const props = defineProps<{
    map: L.Map,
    layerControl: L.Control.Layers
}>()

const windStore = useWindStore()

const colapsed = ref(true)

const windLayerControl = L.layerGroup()
var legend = ref(L.DomUtil.create("div", "leaflet-control-layers leaflet-control"))
legend.value.setAttribute("id", "wind-control")

onBeforeMount(() => {
  let VelocityControl = L.Control.extend({
    onAdd: function() {
      return legend.value
    },
    onRemove: function() {
    },
  })
  let velocityControl = new VelocityControl()
  velocityControl.setPosition("topright")
  velocityControl.addTo(props.map)
})

onMounted(() => {

  windStore.isReady.then(() => {
    props.layerControl.addOverlay(windLayerControl, "<i class='fas fa-globe-europe'></i> Wind");
  })

  let WindLayer = L.GridLayer.extend({
      options: {
          opacity: 0.6,
          zIndex: 10
      },
      initialize: function(options: any) {
          L.setOptions(this, options);
      },
      createTile: function (coords: L.Coords) {

          // create a <canvas> element for drawing
          var tile = L.DomUtil.create('canvas', 'leaflet-tile');
          // setup tile width and height according to the options
          var size = this.getTileSize();
          tile.width = size.x;
          tile.height = size.y;

          const offscreen = tile.transferControlToOffscreen()
          // const ctx = offscreen.getContext('2d');

          // draw something asynchronously and pass the tile to the done() callback
          windStore.drawWind(offscreen, new Date(), coords.x, coords.y, coords.z, size.x, size.y)

          return tile;
      },
  });

  new WindLayer().addTo(windLayerControl)
})

const refTimes = computed(() => {
  console.log("Compute ref times")

  let res = new Array<string>()
  if (!windStore.status) return res

  console.log(windStore.status.forecasts.values())
  for (let references of windStore.status.forecasts.values()) {
    references.forEach((refTime: string) => {
      if (!res.includes(refTime)) {
        res.push(refTime)
      }
    })
  }

  console.log("Ref Times", res)
  return res
})

</script>

<template>
  <Teleport to="#wind-control">
    <div v-if="windStore.status" class="forecast-times" :class="{expanded: !colapsed}">
      <div v-show="!colapsed" class="has-text-centered is-clickable" @click="colapsed = !colapsed">
        <i class="fas fa-caret-up"></i>
      </div>
      <div class="button is-small is-fullwidth is-white p-0">
        <div><i class="fas fa-wind"></i><span style="padding-left:5px">{{ windStore.provider }}</span></div>
      </div>
      <div class="button is-small is-fullwidth is-white p-0" v-for="refTime in refTimes" :key="refTime">
          {{ new Date(refTime).getUTCHours().toString().padStart(2, "0") }}Z
      </div>
      <div class="button is-small is-fullwidth is-white p-0"></div>
      <div v-show="colapsed" class="has-text-centered is-clickable" @click="colapsed = !colapsed">
        <i class="fas fa-caret-down"></i>
      </div>
    </div>
  </Teleport>
</template>

<style>
div.leaflet-top.leaflet-right {
    height: 100%;
    display: flex;
    flex-flow: column;
}
</style>
