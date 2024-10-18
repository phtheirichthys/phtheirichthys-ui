<script setup lang="ts">
import L from 'leaflet'
import { onMounted } from 'vue';

import * as phtheirichthys from '../lib/phtheirichthys'

const props = defineProps<{
    layer: L.Map | L.LayerGroup,
}>()

onMounted(() => {
    phtheirichthys.add_land_provider()
    let LandLayer = L.GridLayer.extend({
        options: {
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
            try {
                phtheirichthys.draw_land(offscreen, coords.x, coords.y, coords.z, size.x, size.y)
            } catch (e) {
                console.error("Error drawing land canvas", e)
            }

            return tile;
        },
    });

    new LandLayer().addTo(props.layer)
})
</script>

<template>
</template>

<style scoped></style>
