<script setup lang="ts">
import { Ref, ref } from 'vue';
import { useBoatsStore } from '../stores/boats';
import { useRacesStore } from '../stores/races';
import Navbar from './Navbar.vue'

const boatsStore = useBoatsStore()
const racesStore = useRacesStore()

const boat: Ref<string | null> = ref(boatsStore.defaultBoat()?.id || null)
const race: Ref<string | null> = ref(null)

</script>

<template>

  <section class="hero is-fullheight">
    <div class="hero-head">
      <Navbar />
    </div>

    <div class="hero-body is-flex-direction-column">
      <div class="container is-max-desktop">
        <div class="columns is-centered">
          <div v-if="boatsStore.boats.size > 0" class="column is-half">
            <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
              <thead>
                <tr>
                  <th class="is-fullwidth"><abbr title="Race">Boat</abbr></th>
                </tr>
              </thead>
              <tbody>
                <tr :class="{'is-selected':b.id === boat}" v-for="b in boatsStore.list()" @click="boat = b.id">
                  <td>{{ b.name }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="column is-half">
            <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
              <thead>
                <tr>
                  <th class="is-fullwidth"><abbr title="Race">Race</abbr></th>
                </tr>
              </thead>
              <tbody>
                <tr :class="{'is-selected':r.id === race}" v-for="r in racesStore.list()" @click="race = r.id">
                  <td>{{ r.name }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="buttons is-centered">
          <RouterLink v-if="race" :to="{ name: 'navigate', params: { boat: boat, race: race! } }" class="button is-primary">Navigate</RouterLink>
          <button v-if="!race" class="button is-centered" disabled>Navigate</button>
          <!-- <button class="button is-primary" @click="navigate()">Navigate</button> -->
        </div>
      </div>
    </div>
  </section>

</template>

<style scoped></style>
