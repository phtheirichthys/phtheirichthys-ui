<script setup lang="ts">
import L from 'leaflet'

import { onMounted } from 'vue';
import type { RouteWaypoint } from '@phtheirichthys/phtheirichthys'
import { useRouteStore } from '../../stores/route'
import Isochrones from './Isochrones.vue'
import * as utils from '../../lib/utils'

const props = defineProps<{
  map: L.Map | L.LayerGroup,
  layerControl: L.Control.Layers,
}>()

const routeStore = useRouteStore()

const layer = L.layerGroup()
layer.addTo(props.map)

routeStore.$onAction(({
  name, // name of the action
  after, // hook after the action returns or resolves
  onError, // hook if the action throws or rejects
}) => {
  if (name === "navigate" || name === "load") {
    // a shared variable for this specific action call
    const startTime = Date.now()
    // this will trigger before an action on `store` is executed
    console.log(`Start "${name}".`)

    // this will trigger if the action succeeds and after it has fully run.
    // it waits for any returned promised
    after(() => {
      console.log(
        `Finished "${name}" after ${
          Date.now() - startTime
        }ms.`
      )
      refresh()
    })

    // this will trigger if the action throws or returns a promise that rejects
    onError((error) => {
      console.warn(
        `Failed "${name}" after ${Date.now() - startTime}ms.\nError: ${error}.`
      )
    })
  }
})

function refresh() {
    layer.clearLayers()

    draw()
}

function draw() {
  if (!routeStore.route) {
    return
  }

  const squareSize = 20
  // const roundSize = 20
  const _editIcon = new L.DivIcon({
                  iconSize: new L.Point(squareSize, squareSize),
                  shadowSize: new L.Point(squareSize + 4, squareSize + 4),
                  className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
  })
  // const _changedIcon = new L.DivIcon({
  //                 iconSize: new L.Point(roundSize, roundSize),
  //                 className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon changed'
  // })
  // const _nightIcon = new L.DivIcon({
  //                 iconSize: new L.Point(squareSize, squareSize),
  //                 className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon night'
  // })
  // const _nightChangedIcon = new L.DivIcon({
  //                 iconSize: new L.Point(roundSize, roundSize),
  //                 className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon night-changed'
  // })
  // const _editIconHighlighted = new L.DivIcon({
  //                 iconSize: new L.Point(squareSize, squareSize),
  //                 shadowSize: new L.Point(squareSize + 4, squareSize + 4),
  //                 className: 'leaflet-div-icon leaflet-editing-icon highlighted leaflet-touch-icon'
  // })
  // const _changedIconHighlighted = new L.DivIcon({
  //                 iconSize: new L.Point(roundSize, roundSize),
  //                 className: 'leaflet-div-icon leaflet-editing-icon highlighted leaflet-touch-icon changed'
  // })
  // const _nightIconHighlighted = new L.DivIcon({
  //                 iconSize: new L.Point(squareSize, squareSize),
  //                 className: 'leaflet-div-icon leaflet-editing-icon highlighted leaflet-touch-icon night'
  // })
  // const _nightChangedIconHighlighted = new L.DivIcon({
  //                 iconSize: new L.Point(roundSize, roundSize),
  //                 className: 'leaflet-div-icon leaflet-editing-icon highlighted leaflet-touch-icon night-changed'
  // })
  // const _icon = new L.DivIcon({
  //                 iconSize: new L.Point(20, 20),
  //                 className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon standard'
  // })
  // const _darkIcon = new L.DivIcon({
  //                 iconSize: new L.Point(20, 20),
  //                 className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon dark'
  // })

  routeStore.route.way.forEach((waypoint) => {
    L.marker([waypoint.from.lat, waypoint.from.lon], {icon: _editIcon, zIndexOffset: 25})
          .bindTooltip(() => getTooltipTitle(waypoint), {permanent: false, opacity: 0.9, offset: L.point(10, 0), className: 'draw-tooltip', direction: 'right'})
          .addTo(layer)
  })

  var polylineOptions = {
        color: 'green',
        weight: 2,
        smoothFactor: 2,
        // lineJoin: "round",
      }
  L.polyline(routeStore.route.way.map((wp) => [wp.from.lat, wp.from.lon]), polylineOptions).addTo(layer)

}

function getTooltipTitle(wayPosition: RouteWaypoint) {
  const sails = ["Jib", "Spi", "Stay", "LJ", "C0", "HG", "LG"];

  const date = new Date(routeStore.route!.infos.start)
  date.setSeconds(date.getSeconds() + wayPosition.duration)

  const delta = Math.abs(new Date(date).getTime() - new Date().getTime()) / 36e5;

  var j = Math.floor(delta / 24)
  var h = Math.floor(delta % 24)
  var m = Math.round(60 * (delta - j * 24 - h))
  if (m == 60) {
    m = 0
    h ++
  }
  if (h == 24) {
    h = 0
    j ++
  }

  var d = date > new Date()?"+":"-"
  if(j > 0) {
    d += j + "j"
  }
  if(h > 0) {
    if(d.length > 0) d += " "
    d += h + "h"
  }
  if(m > 0) {
    if(d.length > 0) d += " "
    d += m + "m"
  }

  var hrs = date.getHours();
  let min = date.getMinutes().toString();
  if (date.getMinutes() < 10) {
    min = "0" + min;
  }

  const twa = utils.twa(wayPosition.boat_settings.heading, wayPosition.status.wind.direction)
  const heading = utils.heading(wayPosition.boat_settings.heading, wayPosition.status.wind.direction)

  let sail = sails[wayPosition.boat_settings.sail.index]
  if (wayPosition.boat_settings.sail.auto === true) {
    sail += "*"
  }

  var primary = "<i class='fa fa-compass'></i> " + heading.toFixed(1) + "° <i class='fa fa-location-arrow'></i> " + twa.toFixed(1) + "° <span class='sail'>" + sail + "</span>"
  if(wayPosition.status.ice) {
    primary += "<span class='ice'><i class='fas fa-igloo'></i></span>"
  } else if(wayPosition.status.foil > 0) {
  //   //primary += "<span class='foil' style='color:rgb(255," + 255 * (wl.foil / 100) + "," + 255 * (wl.foil / 100) + ");'><i class='fa fa-fighter-jet'></i></span>"
    primary += "<span class='foil' style='opacity:" + (wayPosition.status.foil) + "%;'><i class='fa fa-fighter-jet'></i></span>"
  }
  if(wayPosition.status.boost > 0) {
    primary += "<span class='foil' style='opacity:" + (wayPosition.status.boost) + "%;'><i class='fa-solid fa-rocket'></i></span>"
  }
  const secondary = "<i class='fa fa-wind'></i> " + wayPosition.status.wind.direction.toFixed(1) + "° " + wayPosition.status.wind.speed.toFixed(1) + "kt <i class='fa fa-ship'></i> " + wayPosition.status.boat_speed.toFixed(1) + "kt";

  var res = '<div class="date"><span>' + d + '</span><span class="hour">' + hrs + ":" + min + '</span></div><div class="primary">' + primary + '</div>'
  if(secondary)
    res += '<div class="secondary">' + secondary + '</div>';

  var third = ""
  if (wayPosition.status.stamina) {
    third = third + "<span><i class='fa-solid fa-battery-three-quarters'></i> " + wayPosition.status.stamina.toFixed(0) + "% </span>";
  }
  for (var p of wayPosition.status.penalties) {
    let type = ""
    if (p.typ == 1) {
      type = "Gybe"
    } else if (p.typ == 2) {
      type = "Tack"
    } else if (p.typ == 4) {
      type = "Sail"
    }
    third += '<span>' + type + ': ' + p.duration + '</span> '
  }

  if(third.length > 0)
    res += '<div class="secondary">' + third + '</div>';


  return res
}
   
onMounted(() => {
  refresh()
})
</script>

<template>
  <Isochrones :map="layer" :layer-control="layerControl" />
</template>

<style>
.leaflet-div-icon.leaflet-editing-icon {
  border: 8px solid transparent;
  background-clip: padding-box;
}
.leaflet-div-icon.leaflet-editing-icon.highlighted,
.leaflet-div-icon.leaflet-editing-icon:hover {
  border: 6px solid transparent;
  background-clip: padding-box;
}

.leaflet-div-icon.leaflet-editing-icon.leaflet-touch-icon.dark {
    background: "#cccccc";
    border-radius: 50%;
    color: "#777777";
    opacity: 0.4;
    background-clip: padding-box;
}

.leaflet-div-icon.leaflet-editing-icon.leaflet-touch-icon.standard {
    background: white;
    /* border-radius: 50%; */
    color: "#ffffff";
}

.leaflet-div-icon.leaflet-editing-icon.leaflet-touch-icon.night {
    background: red;
    color: "#ff0000";
    background-clip: padding-box;
}

.leaflet-div-icon.leaflet-editing-icon.leaflet-touch-icon.changed {
    background: blue;
    /* border-radius: 50%; */
    background-clip: padding-box;
}

.leaflet-div-icon.leaflet-editing-icon.leaflet-touch-icon.night-changed {
    background: orange;
    color: "#ff0000";
    /* border-radius: 50%; */
    background-clip: padding-box;
}

.leaflet-div-icon.leaflet-bearingline-icon.leaflet-touch-icon {
    background: #3bdbd5;
    color: #3bdbd5;
    border-radius: 50%;
    border: 8px solid transparent;
    background-clip: padding-box;
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
}
.leaflet-div-icon.leaflet-twaline-icon.leaflet-touch-icon:hover {
  border: 6px solid transparent;
}

.leaflet-tooltip.draw-tooltip .date {
  color: #c0d7f9;
  font-weight: bold;
}

.leaflet-tooltip.draw-tooltip .date .hour {
  float: right;
}

.leaflet-tooltip.draw-tooltip .primary {
  color: #ffffff;
}

.leaflet-tooltip.draw-tooltip .primary .sail {
  font-weight: bold;
}

.leaflet-tooltip.draw-tooltip .primary .foil {
  float: right;
}

.leaflet-tooltip.draw-tooltip .primary .ice {
  float: right;
}

.leaflet-tooltip.draw-tooltip .secondary {
  color: #f8d5e4;
}

.leaflet-tooltip.draw-tooltip {
    background: rgb(54, 54, 54);
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid transparent;
    -webkit-border-radius: 4px;
    border-radius: 4px;
    color: #fff;
    font: 12px/18px "Helvetica Neue", Arial, Helvetica, sans-serif;
    margin-left: 10px;
    margin-top: -21px;
    padding: 4px 8px;
    white-space: nowrap;
    z-index: 6;
    box-shadow: 0 0 0;
}

.leaflet-tooltip.draw-tooltip:before {
    border-right: 6px solid black;
    border-right-color: rgba(0, 0, 0, 0.5);
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    content: "";
    position: absolute;
    top: 22px;
}
</style>
