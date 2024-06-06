<script setup lang="ts">
import { Coords } from '@phtheirichthys/phtheirichthys';
import { computed, ref } from 'vue';
import { Utils } from '../lib/utils';

const props = defineProps<{
  edit: boolean,
  buoy: any,
}>()

const buoy = ref(props.buoy)

console.log("buoy", buoy)

const colorClassLeft = computed(() => {
  return {
    'start': buoy.value.type === 'START',
    'end': buoy.value.type === 'END' && buoy.value.latlons.length == 1,
    'end-left': buoy.value.type === 'END' && buoy.value.latlons.length > 1 && true,
    'end-right': buoy.value.type === 'END' && buoy.value.latlons.length > 1 && false,
    'buoy': buoy.value.type === 'WAYPOINT',
    'door-left': buoy.value.type === 'DOOR' && true,
    'door-right': buoy.value.type === 'DOOR' && false,
    'validated': buoy.value.validated,
  }
})

const colorClassRight = computed(() => {
  return {
    'start': buoy.value.type === 'START',
    'end': buoy.value.type === 'END' && buoy.value.latlons.length == 1,
    'end-left': buoy.value.type === 'END' && buoy.value.latlons.length > 1 && false,
    'end-right': buoy.value.type === 'END' && buoy.value.latlons.length > 1 && true,
    'buoy': buoy.value.type === 'WAYPOINT',
    'door-left': buoy.value.type === 'DOOR' && false,
    'door-right': buoy.value.type === 'DOOR' && true,
    'validated': buoy.value.validated,
  }
})

function endIsADoor() {
  if(buoy.value.latlons.length == 1) {
    buoy.value.latlons.push({lat: 0, lon: 0})
  } else {
    buoy.value.latlons.pop()
  }
}

function coord(coords: Coords) {
  var lat = Utils.dd2dms(coords.lat)
  var lon = Utils.dd2dms(coords.lon)

  return Utils.lat2string(lat) + " - " + Utils.lon2string(lon)
}

function reverse() {
  buoy.value = props.buoy
}

</script>

<template>
  <div class="card mb-3">
    <div v-show="edit" class="dragger has-text-grey-lighter">
      <span v-if="buoy.type!== 'START' && buoy.type!== 'END'" class="icon">
        <i class="fas fa-grip-vertical"></i>
      </span>
    </div>
    <div class="card-content p-2" :class="{'with-dragger': edit}">
      <div class="media mb-1">
        <div class="media-content">
          <div class="columns is-gapless is-vcentered is-mobile">
            <div class="column">
              <div v-if="!edit || buoy.type=== 'START'" class="subtitle is-6">{{ buoy.type}}</div>
              <div v-if="edit && buoy.type!== 'START' && buoy.type!== 'END'" class="select is-small">
                <select v-model="buoy.type">
                  <option value="DOOR">DOOR</option>
                  <option value="WAYPOINT">WAYPOINT</option>
                </select>
              </div>
              <div v-if="edit && buoy.type=== 'END'" class="is-small">
                <label class="checkbox">
                  <input type="checkbox" :checked="buoy.latlons.length > 1" @change="endIsADoor()">
                  Door
                </label>
              </div>
            </div>
            <div class="column">
              <div v-if="!edit || buoy.type=== 'START' || buoy.type=== 'END'" class="title is-4">{{ buoy.name }}</div>
              <input v-if="edit && buoy.type!== 'START' && buoy.type!== 'END'" v-model="buoy.name" class="input is-small" type="text">
            </div>
          </div>
        </div>
        <div class="media-right">
          <button v-show="edit && buoy.type!== 'START' && buoy.type!== 'END'" class="button is-small is-white">
            <span class="icon is-small">
              <i class="fas fa-trash"></i>
            </span>
          </button>
        </div>
      </div>

      <div class="content">
        <div class="columns is-gapless is-vcentered is-mobile">
          <div class="column">
            <div>
              <span class="icon-text" :class="colorClassLeft"><span class="icon"><i class="fas fa-square-full" :class="{'start': edit, 'waypoint': !edit}"></i></span>
              <span>{{ coord(buoy.latlons[0]) }}</span></span>
            </div>
            <div v-if="buoy.latlons.length > 1">
              <span class="icon-text" :class="colorClassRight"><span class="icon"><i class="fas fa-square-full"></i></span>
              <span>{{ coord(buoy.latlons[1]) }}</span></span>
            </div>

            <div v-if="buoy.type=== 'END' && buoy.latlons.length == 1">
              <span class="icon-text">
                <span class="icon">
                  <i class="far fa-circle"></i>
                </span>
                <span v-show="!edit">{{ buoy.radius }} milles</span>
                <span v-show="edit">
                  <div class="field has-addons">
                    <p class="control">
                      <a class="button  is-small is-static">
                        NM
                      </a>
                    </p>
                    <p class="control">
                      <input v-model="buoy.radius" class="input is-small" type="text">
                    </p>
                  </div>
                </span>
              </span>
            </div>
          </div>
          <div class="column is-narrow">
            <button v-show="edit && buoy.type== 'DOOR'" class="button is-small is-white" @click="reverse()">
              <span class="icon is-small">
                <i class="fas fa-random"></i>
              </span>
            </button>
            <!-- <span class="icon"><i v-if="buoy.latlons.length > 1" class="fas fa-lg fa-random"></i></span> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.start span :first-of-type {
  color: #28a5db;
}
.validated span :first-of-type {
  color: #28a5db !important;
}
.buoy span :first-of-type {
  color: #f5b72f;
}
.door-left span :first-of-type  {
  color: #9c272b;
}
.door-right span :first-of-type  {
  color: #008c38;
}
.end span :first-of-type  {
  color: #ee8b1c;
}
.end-left span :first-of-type  {
  color: #9c272b;
}
.end-right span :first-of-type  {
  color: #008c38;
}

.dragger {
  height: 100%;
  width: 20px;
  position: absolute;
  display: block;
}

.dragger span {
  height: 100%;
  width: 100%;
  cursor: grab;
}

.with-dragger {
  margin-left: 20px
}
</style>