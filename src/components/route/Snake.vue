<script setup lang="ts">
import L from 'leaflet'
import { onMounted } from 'vue'
import { HeadingHeading, Point } from '../../lib/position'
import { SnakeService } from '../../lib/snake'

const props = defineProps<{
  map: L.Map,
  layerControl: L.Control.Layers
}>()

const layer = new L.LayerGroup()
//const markerLayer = L.layerGroup().addTo(layer)
const linesLayer = L.layerGroup().addTo(layer)

//var progs: Array<any> = []

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

  props.map.on("mousemove", (event) => {
    let latlng = props.map.containerPointToLatLng(L.point(event.containerPoint.x, event.containerPoint.y))
    
    const position = new Point(0, 0)

    let b = Math.round(bearingTo(position, Point.fromLatLng(latlng)))
    if(b == 360) b = 0

    try {
      let snake_result = SnakeService.eval_snake(new HeadingHeading(b))

      display(snake_result)
      console.log("Snake", snake_result)
    } catch {}

  })
})

function bearingTo(from: Point, to: Point) {
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

function display(headingLine: Array<Array<number | Point>>) {
  linesLayer.clearLayers()
  displayLine(headingLine, false)
}

function displayLine(line: Array<Array<number | Point>>, isTwa: boolean) {
  var path = [];
  const boatLine = line

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

  console.log(boatLine)
  for(var wl of boatLine) {
    const pt = wl[1] as Point
    L.marker([pt.lat, pt.lon], {icon: icon, zIndexOffset: isTwa ? 75 : 50})
      .addTo(linesLayer)
    path.push(new L.LatLng(pt.lat, pt.lon));
  }
  L.polyline(path, {color: color, weight: 1, smoothFactor: 2, lineJoin: 'round', opacity: 0.9}).addTo(linesLayer);
}
</script>

<style>
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