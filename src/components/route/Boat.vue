<script setup lang="ts">
import { onMounted } from 'vue';
import L from 'leaflet'
import 'leaflet-rotatedmarker'
import { BoatConfig } from '../../lib/position';

var marker: L.Marker;

const props = defineProps<{
  layer: L.Map | L.LayerGroup,
  boat: BoatConfig
}>()

onMounted(() => {
  drawBoat()
})


function drawBoat() {
  if (marker) {
    props.layer.removeLayer(marker)
  }

  let className = 'leaflet-boat-icon small ' + (props.boat.type || 'normal')
  if (props.boat.status.aground === true) {
    className += " aground"
  }

  let boatIcon = new L.DivIcon({
    iconSize: [13, 40],
    iconAnchor: [7, 27],
    className: className
  })
  marker = new L.Marker([props.boat.position.lat, props.boat.position.lon], {icon: boatIcon/*, rotationAngle: boat.heading*/}).addTo(props.layer)
}
</script>

<template>
</template>

<style>
.leaflet-boat-icon {
  background: url('/images/boats.png') no-repeat 0 0;
  background-size: 184px 60px;
  background-position: -2px 0px;
}
.leaflet-boat-icon.small {
  background: url('/images/boats-2.png') no-repeat 0 0;
  background-size: 120px 40px;
  background-position: -1px 0px;
  opacity: 0.3;
}
.leaflet-boat-icon.small.normal {
  background-position: -46px 0px;
  opacity: 0.7;
}
.leaflet-boat-icon.small.normal.aground {
  background-position: -31px 0px;
  opacity: 0.7;
}
.leaflet-boat-icon.small.normal.team {
  background-position: -31px 0px;
}
.leaflet-boat-icon.small.normal.followed {
  background-position: -46px 0px;
}
.leaflet-boat-icon.small.ghost {
  background-position: -1px 0px;
}
.leaflet-boat-icon.small.ghost.aground {
  background-position: -31px 0px;
}
.leaflet-boat-icon.small.certified {
  background-position: -61px 0px;
}
.leaflet-boat-icon.small.real {
  background-position: -76px 0px;
}
.leaflet-boat-icon.small.top {
  background-position: -91px 0px;
}
.leaflet-boat-icon.small.sponsor {
  background-position: -106px 0px;
}
.leaflet-boat-icon.small:hover,
.leaflet-boat-icon.small.normal:hover,
.leaflet-boat-icon.small.normal.team:hover,
.leaflet-boat-icon.small.normal.followed:hover,
.leaflet-boat-icon.small.ghost:hover,
.leaflet-boat-icon.small.ghost.aground:hover,
.leaflet-boat-icon.small.certified:hover,
.leaflet-boat-icon.small.real:hover,
.leaflet-boat-icon.small.top:hover,
.leaflet-boat-icon.small.sponsor:hover {
  opacity: 1;
}
.leaflet-tooltip.draw-tooltip.boat:before {
  content: none;
}
.leaflet-tooltip.draw-tooltip .name {
  color: #c0d7f9;
  font-weight: bold;
}
.leaflet-tooltip.draw-tooltip .name .hour {
  float: right;
}
.leaflet-tooltip.draw-tooltip .is {
  font-weight: bold;
}
</style>