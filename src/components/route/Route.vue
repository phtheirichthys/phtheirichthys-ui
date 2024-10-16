<script setup lang="ts">
import L from 'leaflet'

import { RouteResult } from '@phtheirichthys/phtheirichthys';
import { onMounted, ref, watch } from 'vue';

const props = defineProps<{
  layer: L.Map | L.LayerGroup,
  route: RouteResult
}>()


const layer = ref(L.layerGroup())
layer.value.addTo(props.layer)


function redraw() {
  const squareSize = 20
  const roundSize = 20
  const _editIcon = new L.DivIcon({
                  iconSize: new L.Point(squareSize, squareSize),
                  shadowSize: new L.Point(squareSize + 4, squareSize + 4),
                  className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
  })
  const _changedIcon = new L.DivIcon({
                  iconSize: new L.Point(roundSize, roundSize),
                  className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon changed'
  })
  const _nightIcon = new L.DivIcon({
                  iconSize: new L.Point(squareSize, squareSize),
                  className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon night'
  })
  const _nightChangedIcon = new L.DivIcon({
                  iconSize: new L.Point(roundSize, roundSize),
                  className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon night-changed'
  })
  const _editIconHighlighted = new L.DivIcon({
                  iconSize: new L.Point(squareSize, squareSize),
                  shadowSize: new L.Point(squareSize + 4, squareSize + 4),
                  className: 'leaflet-div-icon leaflet-editing-icon highlighted leaflet-touch-icon'
  })
  const _changedIconHighlighted = new L.DivIcon({
                  iconSize: new L.Point(roundSize, roundSize),
                  className: 'leaflet-div-icon leaflet-editing-icon highlighted leaflet-touch-icon changed'
  })
  const _nightIconHighlighted = new L.DivIcon({
                  iconSize: new L.Point(squareSize, squareSize),
                  className: 'leaflet-div-icon leaflet-editing-icon highlighted leaflet-touch-icon night'
  })
  const _nightChangedIconHighlighted = new L.DivIcon({
                  iconSize: new L.Point(roundSize, roundSize),
                  className: 'leaflet-div-icon leaflet-editing-icon highlighted leaflet-touch-icon night-changed'
  })
  const _icon = new L.DivIcon({
                  iconSize: new L.Point(20, 20),
                  className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon standard'
  })
  const _darkIcon = new L.DivIcon({
                  iconSize: new L.Point(20, 20),
                  className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon dark'
  })

  props.route.way.forEach((waypoint) => {
    var marker = L.marker([waypoint.from.lat, waypoint.from.lon], {icon: _icon, zIndexOffset: 25})
          .addTo(props.layer)
  })
}

onMounted(() => {
  redraw()
})
</script>

<template>
</template>

<style>
</style>
