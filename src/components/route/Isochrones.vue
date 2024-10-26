<script setup lang="ts">
import L, { Layer } from 'leaflet'
import { useRouteStore } from '../../stores/route'

const props = defineProps<{
  map: L.Map | L.LayerGroup,
  layerControl: L.Control.Layers
}>()

const routeStore = useRouteStore()

routeStore.$onAction(({
  name, // name of the action
  after, // hook after the action returns or resolves
}) => {
  if (name === "navigate") {
    after(() => {
      refresh()
    })
  }
})

const layer = L.layerGroup()
layer.addTo(props.map)

function refresh() {
    layer.eachLayer((l: Layer) => {
        props.layerControl.removeLayer(l)
    })
    layer.clearLayers()

    drawIsochrones()
    drawDebug()
}

function drawIsochrones() {
    if (!routeStore.route) {
        return
    }

    var first = true
    for(let section of routeStore.route.sections) {
        let section_layer = L.layerGroup().addTo(layer);
        props.layerControl.addOverlay(section_layer, "<i class='fas fa-map-marker-alt'></i> " + section.door)

        // const icon = new L.DivIcon({
        //     iconSize: new L.Point(21, 21),
        //     className: 'leaflet-div-icon route-div-icon'
        // })

        if (!first) {
            layer.removeLayer(section_layer)
        }
        first = false

        let cpt = 0
        for(let iso of section.isochrones) {
            for(let path of iso.paths) {

            const p = path.map(pt => new L.LatLng(pt.lat, pt.lon, pt.previous))

            if (p.length > 2) {
                var color = iso.color
                if (iso.color == "%24") {
                color = "#8e268e"
                } else if (iso.color == "%6") {
                color = "#8e8e26"
                } else if (iso.color == "%1") {
                color = "#268e8e"
                } else if (iso.color == "%0") {
                color = "#b75887"
                }
                L.polyline(p, {color: color, weight: 0.5, smoothFactor: 2, lineJoin: 'round'})
                // .on('click', () => {
                //     for (let pos of p) {
                //         let marker = L.marker(pos, {icon: icon, zIndexOffset: 25, title: pos.alt?.toString() ?? undefined})
                //             .on('click', () => {
                //             // collect all points with same az and draw a line
                //             let previous = pos.alt
                //             let azs = [];
                //             for(let iso of section.isochrones) {
                //                 let found = false
                //                 for (let path of iso.paths) {
                //                 for (let pt of path) {
                //                     if (pt.az == previous) {
                //                     azs.push(new L.LatLng(pt.lat, pt.lon))
                //                     previous = pt.previous
                //                     found = true
                //                     break
                //                     }
                //                 }
                //                 if (found) {
                //                     break
                //                 }
                //                 }
                //             }
                //             L.polyline(azs, {color: "white", weight: 0.5, smoothFactor: 2, lineJoin: 'round'}).addTo(section_layer)
                //             }).addTo(section_layer)
                //     }
                // })
                .addTo(section_layer)
            }
            }
            cpt++
        }
    }
}

function drawDebug() {
    if (!routeStore.route || !routeStore.route.debug) {
        return
    }

    let section_layer = L.layerGroup().addTo(layer);
    props.layerControl.addOverlay(section_layer, "<i class='fas fa-bug'></i>")

    const icon = new L.DivIcon({
        iconSize: new L.Point(21, 21),
        className: 'leaflet-div-icon debug-div-icon'
    })
    const p = routeStore.route.debug.map(pt => new L.LatLng(pt.lat, pt.lon, pt.az))

    //L.polyline(p, {color: "coral", weight: 0.5, smoothFactor: 2, lineJoin: 'round'}).addTo(this.map)
    for (var pt of p) {
        L.marker(pt, {icon: icon, zIndexOffset: 25, title: pt.alt?.toString() ?? undefined}).addTo(section_layer)
    }
}


</script>

<template>
  <div></div>
</template>

<style>

.leaflet-div-icon.debug-div-icon {
  border: 9px solid transparent;
  background-color: coral;
  background-clip: content-box;
  box-sizing: border-box;
  border-radius: 50%;
}

.leaflet-div-icon.debug-div-icon:hover {
  border: 2px solid transparent;
  background-color: coral;
  background-clip: content-box;
  box-sizing: border-box;
  border-radius: 50%;
}

</style>