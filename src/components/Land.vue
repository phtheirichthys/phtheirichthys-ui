<script setup lang="ts">
import L from 'leaflet'
import { onMounted } from 'vue';

import * as phtheirichthys from '@phtheirichthys/phtheirichthys'

const props = defineProps<{
    layer: L.Map | L.LayerGroup,
}>()

phtheirichthys.add_land_provider()

onMounted(() => {
    let LandLayer = L.GridLayer.extend({
        options: {
            zIndex: 10
        },
        initialize: function(options: any) {
            L.setOptions(this, options);
        },
        createTile: function (coords: L.Coords) {

            console.log("create tile", coords)

            // create a <canvas> element for drawing
            var tile = L.DomUtil.create('canvas', 'leaflet-tile');
            const ctx = tile.getContext('2d');

            // setup tile width and height according to the options
            var size = this.getTileSize();
            tile.width = size.x;
            tile.height = size.y;

            // draw something asynchronously and pass the tile to the done() callback

            try {
                console.log("Draw land", "vr", coords.x, coords.y, coords.z, size.x, size.y)
                phtheirichthys.draw_land("vr", ctx, coords.x, coords.y, coords.z, size.x, size.y)
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