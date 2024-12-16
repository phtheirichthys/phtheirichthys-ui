
<script setup lang="ts">
import { ref } from 'vue';
import { useParamsStore } from '../stores/params';

import Navbar from './Navbar.vue'

const paramsStore = useParamsStore()

let steps = ref(paramsStore.params.route_steps.map((s) => {
  return {until: s.until / 60 / 60, step: s.step / 60}
}))


function add() {
  if (steps.value.length > 1) {
    steps.value.splice(steps.value.length - 1, 0, {until: steps.value[steps.value.length - 2].until, step: steps.value[steps.value.length - 2].step});
  } else {
    steps.value.unshift({until: 12, step: 60});
  }
}

function save() {
  paramsStore.setParams({
    route_steps: steps.value.map((s) => {
      return {until: s.until * 60 * 60, step: s.step * 60}
    })
  })
}


</script>

<template>
  <section class="hero is-fullheight">
    <div class="hero-head">
      <Navbar />
    </div>
    <div class="hero-body is-flex-direction-column">
      <div class="container">
        <div class="title is-4 mb-3">Routing Steps</div>
        <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
          <thead>
            <tr>
              <th class=""><abbr title="Until">Until (from routing start in hours)</abbr></th>
              <th class=""><abbr title="Step">Step (minutes)</abbr></th>
              <th>
                <button class="button is-small is-white" @click="add">
                  <span class="icon is-small">
                    <i class="fas fa-plus"></i>
                  </span>
                </button>
                <button class="button is-small is-white" @click="save">
                  <span class="icon is-small">
                    <i class="far fa-floppy-disk"></i>
                  </span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(step, index) in steps">
              <td><div v-if="index < steps.length - 1" class="field">
                <p class="control is-expanded">
                <input class="input is-small" type="text" v-model="step.until">
                </p>
              </div></td>
              <td><div class="field">
                <p class="control is-expanded">
                <input class="input is-small" type="text" v-model="step.step">
                </p>
              </div></td>
              <td>
                <button v-if="index < steps.length - 1" class="button is-small is-white" @click="steps.splice(index, 1)">
                  <span class="icon is-small">
                    <i class="fas fa-trash"></i>
                  </span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
