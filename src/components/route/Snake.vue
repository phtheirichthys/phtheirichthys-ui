<script setup lang="ts">
import type { Coords, RouteWaypoint, Snake } from '@phtheirichthys/phtheirichthys'
import { Point } from '../../lib/position'
import { onMounted } from 'vue'
import L from 'leaflet'
import { useSnakeStore } from '../../stores/snake'
import * as utils from '../../lib/utils'

const props = defineProps<{
  polarId: string,
  map: L.Map,
  layerControl: L.Control.Layers
}>()

const snakeStore = useSnakeStore()

const layer = new L.LayerGroup()
const linesLayer = L.layerGroup().addTo(layer)
const bigIcon = new L.DivIcon({
      iconSize: new L.Point(300, 300),
      className: 'leaflet-div-icon leaflet-snaking-icon leaflet-touch-icon'
  })
const smallIcon = new L.DivIcon({
    iconSize: new L.Point(100, 100),
    className: 'leaflet-div-icon leaflet-snaking-icon leaflet-touch-icon'
})
const snakingCmd = L.marker([snakeStore.last.lat, snakeStore.last.lon], {icon: smallIcon, opacity: 0.1, zIndexOffset: 25})
  .on("mousedown", onDragStart)
  .addTo(layer)

props.layerControl.addOverlay(layer, "<i class='fa fa-route'></i> Snake")

onMounted(() => {

  layer.addTo(props.map)
  
  props.map.on("overlayremove", (event) => {
    if(event.layer === layer) {
      //TODO : gérer suppression du layer
    }
  })
  props.map.on("overlayadd", (event) => {
    if (event.layer === layer) {
      //TODO : gérer l'ajout du layer
    }
  })

  snakingCmd.getElement()?.addEventListener("touchstart", onDragStart)

})

let snakeHeading = 0
let initialSnakingCmdHeading: number | null = null

function onDragStart(event: any) {
  if (event.originalEvent)
    L.DomEvent.stop(event.originalEvent)
  else
    L.DomEvent.stop(event)

  console.log("Start snaking")
  snakingCmd.setOpacity(0.3)
  snakingCmd.setIcon(bigIcon)

  props.map.dragging.disable();
  props.map
    .on("mousemove", onDrag)
    .on("mouseup", onDragEnd)
  L.DomEvent
      .on(document.documentElement, "touchmove", onDrag)
      .on(document.documentElement, "touchend", onDragEnd);
}

function onDrag(event: any) {
  if (event.originalEvent)
    L.DomEvent.stop(event.originalEvent)
  else
    L.DomEvent.stop(event)

  var containerPoint = event.containerPoint
  if (event.touches && event.touches.length >= 1) {
    containerPoint = props.map.mouseEventToContainerPoint(event.touches[0])
  }
  if (!containerPoint) {
    return
  }
  let latlng = props.map.containerPointToLatLng(L.point(containerPoint.x, containerPoint.y))
  let heading = Math.round(bearingTo(snakeStore.last, Point.fromLatLng(latlng)))

  if (!initialSnakingCmdHeading) {
    initialSnakingCmdHeading = heading
  }

  let delta_heading = heading >= initialSnakingCmdHeading ? heading - initialSnakingCmdHeading : heading + 360 - initialSnakingCmdHeading

  let h = snakeHeading + delta_heading
  while (h < 0) h += 360
  while (h >= 360) h -= 360

  snakeStore.get(h).then((snake) => {
    display(snake)
  }).catch((e) => {
    console.error(e)
  })

}

function onDragEnd(event: any) {
  snakingCmd.setOpacity(0.1)
  snakingCmd.setIcon(smallIcon)

  let latlng = props.map.containerPointToLatLng(L.point(event.containerPoint.x, event.containerPoint.y))
  let heading = Math.round(bearingTo(snakeStore.last, Point.fromLatLng(latlng)))

  snakeHeading += heading - initialSnakingCmdHeading!

  while (snakeHeading < 0) snakeHeading += 360
  while (snakeHeading >= 360) snakeHeading -= 360

  initialSnakingCmdHeading = null

  console.log("Stop snaking", snakeHeading)

  props.map
    .off("mousemove", onDrag)
    .off("mouseup", onDragEnd)
  L.DomEvent
    .off(document.documentElement, "touchmove", onDrag)
    .off(document.documentElement, "touchend", onDragEnd);

  props.map.dragging.enable();
}

function bearingTo(from: Coords, to: Coords) {
  const toRadians = (a: number) => a * π / 180.0
  const toDegrees = (a: number) => a * 180.0 / π
  const wrap360 = (d: number) => {
    if (0.0 <= d && d < 360.0) {
      return d
    }
    return (d + 360)%360
  }

  const π = Math.PI

  const φ1 = toRadians(from.lat)
  const φ2 = toRadians(to.lat)

  var Δλ = toRadians(to.lon - from.lon)
  if (Math.abs(Δλ) > π) {
    if (Δλ > 0) {
      Δλ = -(2*π - Δλ)
    } else {
      Δλ = (2*π + Δλ)
    }
  }

  const Δψ = Math.log(Math.tan(φ2/2+π/4) / Math.tan(φ1/2+π/4))

  const θ = Math.atan2(Δλ, Δψ)

  const b = toDegrees(θ)

  return wrap360(b)
}

function display(snake: Snake) {
  linesLayer.clearLayers()
  displayLine(snake.heading, false)
  displayLine(snake.twa, true)
}

function displayLine(waypoints: RouteWaypoint[], isTwa: boolean) {
  var color = "#3bdbd5"
  var icon = new L.DivIcon({
      iconSize: new L.Point(20, 20),
      className: 'leaflet-div-icon leaflet-bearingline-icon leaflet-touch-icon'
  })
  if (isTwa) {
    color = "#ef1780"
    icon = new L.DivIcon({
        iconSize: new L.Point(20, 20),
        className: 'leaflet-div-icon leaflet-twaline-icon leaflet-touch-icon'
    })
  }

  let path = new Array<L.LatLng>()

  waypoints.forEach((waypoint) => {
    const pt = waypoint.from
    L.marker([pt.lat, pt.lon], {icon: icon, zIndexOffset: isTwa ? 75 : 50})
      .bindTooltip(() => utils.getTooltipTitle(new Date(), waypoint), {permanent: false, opacity: 0.9, offset: L.point(10, 0), className: 'draw-tooltip', direction: 'right'})
      .addTo(linesLayer)
    path.push(new L.LatLng(pt.lat, pt.lon));
  })
  L.polyline(path, {color: color, weight: 1, smoothFactor: 2, lineJoin: 'round', opacity: 0.9}).addTo(linesLayer);
}
</script>

<template>
</template>

<style>
.leaflet-div-icon.leaflet-snaking-icon.leaflet-touch-icon {
    background: #000000;
    color: #000000;
    border-radius: 50%;
    border: 8px solid transparent;
    background-clip: padding-box;
    box-sizing: border-box;
}


.leaflet-div-icon.leaflet-bearingline-icon.leaflet-touch-icon {
    background: #3bdbd5;
    color: #3bdbd5;
    border-radius: 50%;
    border: 8px solid transparent;
    background-clip: padding-box;
    box-sizing: border-box;
}
.leaflet-div-icon.leaflet-bearingline-icon.leaflet-touch-icon:hover {
  border: 6px solid transparent;
}

.leaflet-div-icon.leaflet-twaline-icon.leaflet-touch-icon {
    background: #ef1780;
    color: #ef1780;
    border-radius: 50%;
    border: 8px solid transparent;
    background-clip: padding-box;
    box-sizing: border-box;
}
.leaflet-div-icon.leaflet-twaline-icon.leaflet-touch-icon:hover {
  border: 6px solid transparent;
}
</style>
