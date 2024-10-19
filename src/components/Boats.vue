<script setup lang="ts">
import { computed, ref, Ref } from 'vue';
import { useBoatsStore } from '../stores/boats';

import Navbar from './Navbar.vue'

const boatsStore = useBoatsStore()

const boats = ref(boatsStore.list())

const boatId: Ref<string | null> = ref(null)

function select(id: string) {
    boatId.value = id
}

function remove(id: string) {
  boatsStore.remove(id.toString())
  boats.value = boatsStore.list()
  if (boatId.value === id) {
    boatId.value = null
  }
}

let newBoat = ref({display: false, name: ""})

const newBoatId = computed(() => {
  return newBoat.value.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()
})

function add() {
  boatsStore.add({id: newBoatId.value, name: newBoat.value.name})
  cleanNewBoat()
}

function cleanNewBoat() {
  newBoat.value.display = false
  newBoat.value.name = ""
}

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
                  <th class=""><abbr title="Id">Id</abbr></th>
                  <th class="" style="width: 100%"><abbr title="Name">Name</abbr></th>
                  <th>
                    <button v-if="!newBoat.display" class="button is-small is-white" @click="newBoat.display = true">
                      <span class="icon is-small">
                        <i class="fas fa-plus"></i>
                      </span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="boat of boatsStore.boats.values()" @click="select(boat.id)">
                  <td>{{ boat.id }}</td>
                  <td>{{ boat.name }}</td>
                  <td>
                    <button class="button is-small is-white" @click="remove(boat.id)">
                      <span class="icon is-small">
                        <i class="fas fa-trash"></i>
                      </span>
                    </button>
                  </td>
                </tr>
                <tr v-if="newBoat.display">
                  <td>{{ newBoatId }}</td>
                  <td>
                    <input class="input" type="text" placeholder="Boat name" v-model="newBoat.name">
                  </td>
                  <td class="" style="white-space:nowrap">
                    <button class="button is-small is-white" @click="cleanNewBoat">
                      <span class="icon is-small">
                        <i class="fas fa-rotate-left"></i>
                      </span>
                    </button>
                    <button class="button is-small is-white" @click="add">
                      <span class="icon is-small">
                        <i class="far fa-floppy-disk"></i>
                      </span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
