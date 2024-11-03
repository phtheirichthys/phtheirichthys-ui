<script setup lang="ts">
import { defineProps, ref, Ref, toRaw, onMounted, watch } from 'vue';
import L from 'leaflet';
import { Race, Buoy as IBuoy } from '@phtheirichthys/phtheirichthys'
import { useRacesStore } from '../../stores/races'
import { usePolarsStore } from '../../stores/polars'
import Buoy from '../Buoy.vue'
import Start from './Start.vue'
import draggable from 'vuedraggable'

const racesStore = useRacesStore()

const props = defineProps<{
    raceId: string,
}>()

const emit = defineEmits(['save'])

const race: Ref<Race> = ref(JSON.parse(JSON.stringify(toRaw(racesStore.get(props.raceId) || racesStore.newRace()))))

const polarsStore = usePolarsStore()
const edit = ref(props.raceId === "")

const layer = L.layerGroup()

watch(() => props.raceId, () => {
  console.log("Race Id changed", props.raceId)
  race.value = JSON.parse(JSON.stringify(toRaw(racesStore.get(props.raceId) || racesStore.newRace())))
  edit.value = props.raceId === ""
})

onMounted(() => {
  const map = new L.Map("map", {zoomControl: true, attributionControl: false, worldCopyJump: false}).setView([0, 0], 4)
  map.whenReady(() => {
    L.tileLayer.provider('CartoDB.PositronNoLabels').addTo(map)
    layer.addTo(map)
  })
})

function reset() {
  race.value = JSON.parse(JSON.stringify(toRaw(racesStore.get(props.raceId) || racesStore.newRace())))
}

function add() {
  race.value!.buoys.push({
    name: "",
    type: "Waypoint",
    destination: {"lat": 0, "lon": 0},
    to_avoid: [],
    validated: false,
  })
}

function changeName() {
  if (props.raceId === "") {
    race.value.id = race.value.name
      .toLowerCase()
      .replace(/[éèê]/g, "e")
      .replace(/[àâ]/g, "a")
      .replace(/[îï]/g, "i")
      .replace(/[^a-z0-9]/g, "-")
  }
}

function save() {
  edit.value = false
  console.log(race.value)
  racesStore.save(toRaw(race.value!))
  
  emit('save', race.value.id)
}

function validate(buoy: IBuoy) {
  console.log("validate", buoy.validated)
  buoy.validated = !buoy.validated
  console.log("validate", buoy.validated)
}

function change(index: number, buoy: IBuoy) {
  console.log("buoy changed", index, buoy)
  race.value.buoys[index] = buoy
  //racesStore.save(toRaw(race.value))
}

function deleteBuoy(index: number) {
  console.log("buoy deleted", index, race.value)
  console.log("before", race.value.buoys)
  race.value.buoys.splice(index, 1)
  console.log("after", race.value.buoys)
}
</script>

<template>
    <div class="columns">
        <div v-if="race" class="column is-half">
        <div class="card mb-3">
            <div class="card-content p-2">
            <div class="media mb-1">
                <div class="media-content">
                <div class="title is-4 mb-3">{{ race.name }}</div>
                </div>
                <div class="media-right">
                <button v-show="!edit" class="button is-small is-white" @click="edit = true">
                    <span class="icon is-small">
                    <i class="far fa-edit"></i>
                    </span>
                </button>
                <button v-show="edit" class="button is-small is-white" @click="reset">
                    <span class="icon is-small">
                    <i class="fas fa-sync"></i>
                    </span>
                </button>
                <button v-show="edit" class="button is-small is-white" @click="add">
                    <span class="icon is-small">
                    <i class="fas fa-plus"></i>
                    </span>
                </button>
                <button v-show="edit" class="button is-small is-white" @click="save">
                    <span class="icon is-small">
                    <i class="fas fa-times"></i>
                    </span>
                </button>
                </div>
            </div>

            <div class="content">
                <fieldset :disabled="!edit">
                <div class="field is-horizontal">
                    <div class="field-label is-normal">
                    <label class="label" style="white-space: nowrap;">Id</label>
                    </div>
                    <div class="field-body">
                    <div class="field">
                        <p class="control is-expanded">
                        <input class="input is-small" type="text" disabled v-model="race.id">
                        </p>
                    </div>
                    </div>
                </div>
                <div class="field is-horizontal">
                    <div class="field-label is-normal">
                    <label class="label" style="white-space: nowrap;">Name</label>
                    </div>
                    <div class="field-body">
                    <div class="field">
                        <p class="control is-expanded">
                        <input class="input is-small" type="text" v-model="race.name" @input="changeName">
                        </p>
                    </div>
                    </div>
                </div>
                <div class="field is-horizontal">
                    <div class="field-label is-normal">
                    <label class="label" style="white-space: nowrap;">Short Name</label>
                    </div>
                    <div class="field-body">
                    <div class="field">
                        <p class="control is-expanded">
                        <input class="input is-small" type="text" v-model="race.shortName">
                        </p>
                    </div>
                    </div>
                </div>
                <div class="field is-horizontal">
                    <div class="field-label is-normal">
                    <label class="label" style="white-space: nowrap;">Polar</label>
                    </div>
                    <div class="field-body">
                    <div class="field">
                        <div class="control is-expanded">
                        <div class="select is-fullwidth is-small">
                            <select v-model="race.boat">
                            <option v-for="polar in polarsStore.list()" :key="polar.id" :value="polar.id">{{ polar.label }}</option>
                            </select>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                <!-- <div class="field is-horizontal">
                    <div class="field-body">
                    <div class="field has-addons">
                        <p class="control">
                        <a class="button is-small is-static"><i class="far fa-calendar-alt"></i></a>
                        </p>
                        <p class="control is-expanded">
                        <input class="input is-small" type="text" :value="startTime">
                        </p>
                        <p class="control">
                        <a class="button is-small is-static"><i class="fas fa-angle-right"></i></a>
                        </p>
                        <p class="control is-expanded">
                        <input class="input is-small" type="text" :value="endTime">
                        </p>
                    </div>
                    </div>
                </div> -->
                </fieldset>

                <!-- <bulma_calendar v-if="dates" type="datetime" v-model="dates" :options="calendarOptions" dialog range /> -->
                <!-- <div class="is-4">départ {{ fromNow(race.start_time) }}</div> -->
            </div>
            </div>
        </div>

        <Start :class="{draggable: edit}" :startInit="race.start" :edit="edit" :layer="layer" @change="(position) => race.start = position"></Start>

        <draggable :list="race.buoys" draggable=".draggable" :item-key="(element: IBuoy, index: number) => raceId + index + element.name">
          <template #item="{ element: buoy, index }">
            <Buoy :class="{draggable: edit}" :buoy="buoy" :edit="edit" :layer="layer" @validate="validate(buoy)" @change="(buoy) => change(index, buoy)" @delete="() => deleteBuoy(index)"></Buoy>
          </template>
        </draggable>

        </div>
        <div class="column is-half">
          <div id="map"></div>
        </div>
    </div>
</template>

<style scoped>
#map {
  height: 100%;
  width: 100%;
  min-height: 300px;
}
</style>
