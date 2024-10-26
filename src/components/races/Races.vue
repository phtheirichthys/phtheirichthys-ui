<script setup lang="ts">
import { computed, ref, Ref } from 'vue'
import Navbar from '../Navbar.vue'
import { useRacesStore } from '../../stores/races'
import type { Race as IRace } from '@phtheirichthys/phtheirichthys/phtheirichthys'
import Race from './Race.vue'
//import draggable from 'vuedraggable'

const racesStore = useRacesStore()

//const races = ref(racesStore.list())
const selectedRace: Ref<IRace | null> = ref(null)

const importIsActive = ref(false)
const importText = ref("")
const importError = ref("")

function importRace() {
  console.log("import race", importText.value)

  try {
    racesStore.importRace(importText.value)
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

function addRace() {
  console.log(races.value)
  let newRace = racesStore.newRace()
  select(newRace)
}

function select(race: IRace) {
  selectedRace.value = race
}

function remove(raceId: string) {
  racesStore.remove(raceId)
  console.log("remove race", selectedRace.value?.id, raceId)
  if (selectedRace.value?.id === raceId) {
    selectedRace.value = null
  }
}

const races = computed(() => {
  return Array.from(racesStore.races).map(([, race]) => (race))
})
/*function moveBuoy(event: any) {
  if (event.moved) {
    console.log({from: event.moved.oldIndex, to: event.moved.newIndex})

    //race.value.buoys[event.moved.newIndex] = race.value.buoys.splice(event.moved.oldIndex, 1, race.value.buoys[event.moved.newIndex])[0]
  }
}*/

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
                    <button class="button is-small is-white" @click="remove(race.id)">
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
                <button class="button is-primary" @click="addRace()">Add</button>
              </p>
              <p class="control">
                <button class="button" @click="importIsActive = true">Import</button>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div v-if="selectedRace" class="container">
        <Race :raceInit="selectedRace" />
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
