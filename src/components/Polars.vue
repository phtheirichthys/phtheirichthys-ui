<script setup lang="ts">
import { onBeforeMount, ref, Ref } from 'vue';
import { usePolarsStore } from '../stores/polars';

import Navbar from './Navbar.vue'
import { Polar } from '@phtheirichthys/phtheirichthys';

const polarsStore = usePolarsStore()

const polars = ref(polarsStore.list())

const importIsActive = ref(false)
const importFrom = ref("source")
const importText = ref("")
const importError = ref("")
const polarId: Ref<string | null> = ref(null)

function select(id: string) {
    polarId.value = id
}

function remove(id: string) {
  polarsStore.remove(id.toString())
  polars.value = polarsStore.list()
  if (polarId.value === id) {
    polarId.value = null
  }
}

function importPolar() {

  if (importFrom.value === "source") {
    console.log("import polar", importText.value)

    try {
      polarsStore.importPolar(importText.value)
      importIsActive.value = false
      importText.value = ""
    } catch(e) {
      if(e instanceof SyntaxError) {
        importError.value = (e as SyntaxError).message
      } else {
        importError.value = (e as Error).message;
      }
    }
  } else {
    for (let polar of selectedOldPolar.value) {
      polarsStore.add(polar)
    }
  }
}

async function polarsOldPhtheirichthys(): Promise<Polar[]> {
  const reponse = await fetch("/polars/api/v1/polars");
  const polars = await reponse.json();
  return polars
}

const oldPolars = ref(new Array<Polar>())
const selectedOldPolar = ref(new Array<Polar>())

onBeforeMount(() => {
  polarsOldPhtheirichthys().then((polars) => {
    oldPolars.value = polars
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
                  <th class=""><abbr title="Id">Id</abbr></th>
                  <th class="is-fullwidth"><abbr title="Name">Name</abbr></th>
                  <th class=""><abbr title="Actions"></abbr></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="polar in polars" @click="select(polar.id)">
                  <td>{{ polar.id }}</td>
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
        <label class="label">Import Polar</label>
        <div class="tabs is-boxed is-centered">
          <ul>
            <li :class="{'is-active': importFrom === 'source'}" @click="importFrom = 'source'"><a>Source</a></li>
            <li :class="{'is-active': importFrom === 'static'}" @click="importFrom = 'static'"><a>Static</a></li>
          </ul>
        </div>
        <div class="field" v-if="importFrom === 'source'">
          <div class="control">
            <textarea class="textarea" placeholder="json to import" v-model="importText"></textarea>
            <p class="help is-danger">{{ importError }}</p>
          </div>
        </div>
        <div class="field" v-else>
          <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
            <tbody>
              <tr v-for="polar in oldPolars" @click="selectedOldPolar.includes(polar) ? selectedOldPolar.splice(selectedOldPolar.indexOf(polar), 1) : selectedOldPolar.push(polar)" :class="{'is-selected': selectedOldPolar.includes(polar)}">
                <td>{{ polar.label }}</td>
              </tr>
            </tbody>
          </table>
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
