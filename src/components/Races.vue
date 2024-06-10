<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Navbar from './Navbar.vue'
import { RaceService } from '../lib/races'
import { PolarService } from '../lib/polars'
import { Race, Buoy as IBuoy } from '@phtheirichthys/phtheirichthys'
//import draggable from 'vuedraggable'

import Buoy from './Buoy.vue'
import L from 'leaflet';

const races = ref(RaceService.list())

const importIsActive = ref(false)
const importText = ref("")
const importError = ref("")
const race = ref(RaceService.newRace())
const edit = ref(false)

function importRace() {
  console.log("import race", importText.value)

  try {
    RaceService.importRace(importText.value)
    importIsActive.value = false
    importText.value = ""
  } catch(e) {
    if(e instanceof SyntaxError) {
      importError.value = (e as SyntaxError).message
    } else {
      importError.value = (e as Error).message;
    }
  }
}

function select(r: Race) {
  race.value = r

  console.log(race.value)
}

function reset() {

}

function add() {
  race.value.buoys.push({
    name: "",
    type: "Waypoint",
    destination: {"lat": 0, "lon": 0},
    to_avoid: [],
    validated: false,
  })
}

function save() {
  edit.value = false
  RaceService.save(race.value)
}

function remove(r: Race) {
  RaceService.remove(race.value)
  races.value.splice(races.value.indexOf(r), 1)
  race.value = RaceService.newRace()
}

function validate(buoy: IBuoy) {
  console.log("validate", buoy.validated)
  buoy.validated = !buoy.validated
  console.log("validate", buoy.validated)
}

/*function moveBuoy(event: any) {
  if (event.moved) {
    console.log({from: event.moved.oldIndex, to: event.moved.newIndex})

    //race.value.buoys[event.moved.newIndex] = race.value.buoys.splice(event.moved.oldIndex, 1, race.value.buoys[event.moved.newIndex])[0]
  }
}*/

const layer = L.layerGroup()
onMounted(() => {
  const map = new L.Map("map", {zoomControl: true, attributionControl: false, worldCopyJump: false}).setView([0, 0], 4)
  map.whenReady(() => {
    L.tileLayer.provider('CartoDB.PositronNoLabels').addTo(map)
    layer.addTo(map)
  })
})

</script>

<template>
  <section class="hero is-fullheight">
    <div class="hero-head">
      <Navbar />
    </div>
    <div class="hero-body is-flex-direction-column">
      <div class="container">
        <div class="columns">
          <div class="column is-full">
            <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
              <thead>
                <tr>
                  <th class="is-fullwidth"><abbr title="Name">Name</abbr></th>
                  <th class=""><abbr title="Name">Name</abbr></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="race in races" @click="select(race)">
                  <td>{{ race.name }}</td>
                  <td>
                    <button class="button is-small is-white" @click="remove(race)">
                      <span class="icon is-small">
                        <i class="fas fa-trash"></i>
                      </span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="field is-grouped is-grouped-right">
              <p class="control">
                <button class="button is-primary">Add</button>
              </p>
              <p class="control">
                <button class="button" @click="importIsActive = true">Import</button>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div v-if="race !== null" class="container">
        <div class="columns">
          <div class="column is-half">
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
                  <fieldset disabled>
                    <div class="field is-horizontal">
                      <div class="field-label is-normal">
                        <label class="label" style="white-space: nowrap;">Id</label>
                      </div>
                      <div class="field-body">
                        <div class="field">
                          <p class="control is-expanded">
                            <input class="input is-small" type="text" v-model="race.id">
                          </p>
                        </div>
                      </div>
                    </div>
                    <div class="field is-horizontal">
                      <div class="field-label is-normal">
                        <label class="label" style="white-space: nowrap;">Short</label>
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
                                <option v-for="polar in PolarService.list()" :key="polar.id" :value="polar.id">{{ polar.label }}</option>
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

            <!-- <draggable v-model="race.buoys" draggable=".draggable"> -->
              <!-- <template #item="{element}"> -->
                <Buoy :class="{draggable: edit}" v-for="buoy in race.buoys" :buoy="buoy" :edit="edit" :layer="layer" @validate="validate(buoy)"></Buoy>
              <!-- </template> -->
            <!-- </draggable> -->

          </div>
          <div class="column is-half">
            <div id="map"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <div class="modal" :class="{'is-active': importIsActive}">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="box">
        <div class="field">
          <div class="control">
            <label class="label">Import Race</label>
            <textarea class="textarea" placeholder="json to import" v-model="importText"></textarea>
            <p class="help is-danger">{{ importError }}</p>
          </div>
        </div>
        <div class="field is-grouped is-grouped-right">
          <p class="control">
            <button class="button is-primary" @click="importRace()">Import</button>
          </p>
          <p class="control">
            <button class="button" @click="importIsActive = false">cancel</button>
          </p>
        </div>
      </div>
    </div>
    <button class="modal-close is-large" aria-label="close" @click="importIsActive = false"></button>
  </div>
</template>

<style scoped>
#map {
  height: 100%;
  width: 100%;
}
</style>