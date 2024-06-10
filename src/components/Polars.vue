<script setup lang="ts">
import { ref, Ref } from 'vue';
import { PolarService } from '../lib/polars';

import Navbar from './Navbar.vue'

const polars = ref(PolarService.list())

const importIsActive = ref(false)
const importText = ref("")
const importError = ref("")
const polarId: Ref<number | null> = ref(null)

function select(id: number) {
    polarId.value = id
}

function remove(id: number) {
  PolarService.remove(id)
  polars.value = PolarService.list()
  if (polarId.value === id) {
    polarId.value = null
  }
}

function importPolar() {
  console.log("import polar", importText.value)

  try {
    PolarService.importPolar(importText.value)
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
                <tr v-for="polar in polars" @click="select(polar.id)">
                  <td>{{ polar.label }}</td>
                  <td>
                    <button class="button is-small is-white" @click="remove(polar.id)">
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
                <button class="button" @click="importIsActive = true">Import</button>
              </p>
            </div>
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
            <label class="label">Import Plar</label>
            <textarea class="textarea" placeholder="json to import" v-model="importText"></textarea>
            <p class="help is-danger">{{ importError }}</p>
          </div>
        </div>
        <div class="field is-grouped is-grouped-right">
          <p class="control">
            <button class="button is-primary" @click="importPolar()">Import</button>
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
</style>