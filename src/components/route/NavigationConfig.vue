<script setup lang="ts">
import { Ref, ref, toRaw, watch } from 'vue';
import { useNavigateStore } from '../../stores/navigate'
import * as utils from '../../lib/utils'
import Dms from './Dms.vue'

const navigateStore = useNavigateStore()

const options = ref(toRaw(navigateStore.options))
const position = ref(toRaw(navigateStore.position))
const settings = ref(toRaw(navigateStore.settings))
const heading = ref(utils.heading(settings.value.heading, navigateStore.status.wind.direction))
const twa = ref('twa' in settings.value.heading)

const pasteStatus: Ref<{latitude: -1|0|1, longitude: -1|0|1, heading: -1|0|1}> = ref({
  latitude: 0,
  longitude: 0,
  heading: 0,
})

watch([() => settings.value.heading, () => navigateStore.status.wind.direction], ([h, twd]) => {
  heading.value = utils.heading(h, twd)
  twa.value = 'twa' in settings.value.heading
})

watch(() => navigateStore.position, (p) => {
  position.value = toRaw(p)
})

function change(type: "latitude" | "longitude", value: number) {
  if (type === "latitude") {
    position.value.lat = value
  } else if (type === "longitude") {
    position.value.lon = value
  }
}

function save() {
  console.log(settings.value.heading)
  if (twa.value === true) {
    settings.value.heading = {twa: heading.value}
  } else {
    settings.value.heading = {heading: heading.value}
  }

  navigateStore.setPosition(toRaw(position.value))
  navigateStore.setSettings(toRaw(settings.value))
  navigateStore.setOptions(toRaw(options.value))
}

function setTwa(t: boolean) {
  if (twa.value != t) {
    if (t) {
      heading.value = utils.twa({heading: heading.value}, navigateStore.status.wind.direction)
    } else {
      heading.value = utils.heading({twa: heading.value}, navigateStore.status.wind.direction)
    }
    twa.value = t
  }
}

</script>

<template>
  <h1 class="leaflet-sidebar-header">
    Titre
    <div class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></div>
  </h1>
  <section class="section">
    <div class="field is-grouped">
      <div class="field">
        <label class="label">Cap</label>
        <div class="field has-addons">
          <p class="control">
            <input v-model.number="heading" class="input is-small" :class="{'is-success': pasteStatus.heading === 1, 'is-danger': pasteStatus.heading === -1}" type="text" placeholder="41" style="width:60px">
          </p>
          <p class="control">
            <a class="button is-static is-small">°</a>
          </p>
          <p class="control">
            <button v-if="twa" class="button is-small" @click="setTwa(false)"><span class="icon is-small"><i class="fas fa-wind"></i></span></button>
            <button v-else class="button is-small" @click="setTwa(true)"><span class="icon is-small"><i class="far fa-compass"></i></span></button>
          </p>
        </div>
      </div>
      <div class="field">
        <label class="label">Sail</label>
        <div class="control">
          <div class="select is-small">
            <select v-model.number="settings.sail.index">
              <option value="0">Jib</option>
              <option value="1|0|1">>Spi</option>
              <option value="3">Génois Léger</option>
              <option value="6">Spi Léger</option>
              <option value="4">Code 0</option>
              <option value="2">Trinquette</option>
              <option value="5">Spi Lourd</option>
            </select>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">Auto</label>
        <div class="control">
          <input v-model="settings.sail.auto" type="checkbox">
        </div>
      </div>
    </div>
    <label class="label">Copier - coller</label>
    <div class="field is-grouped">
      <p class="control">
        <!--<input v-model="pasteLatlon" @paste="paste" class="input is-small" type="text">-->
      </p>
    </div>
    <label class="label">Latitude</label>
    <Dms :dd="position.lat" :pasteStatus="pasteStatus.latitude" type="latitude" @change='(lat) => change("latitude", lat)' />
    <label class="label">Longitude</label>
    <Dms :dd="position.lon" :pasteStatus="pasteStatus.longitude" type="longitude" @change='(lon) => change("longitude", lon)' />
    <label class="label">Options</label>
    <div class="columns is-gapless is-multiline is-mobile">
      <div class="column is-one-third">
        <div class="control">
          <div class="field">
            <label class="checkbox">
              <input v-model="options.winch" type="checkbox">
              Winch
            </label>
          </div>
        </div>
      </div>
      <div class="column is-one-third">
        <div class="control">
          <div class="field">
            <label class="checkbox">
              <input v-model="options.foil" type="checkbox">
              Foil
            </label>
          </div>
        </div>
      </div>
      <div class="column is-one-third">
        <div class="control">
          <div class="field">
            <label class="checkbox">
              <input v-model="options.hull" type="checkbox">
              Hull
            </label>
          </div>
        </div>
      </div>
      <div class="column is-one-third">
        <div class="control">
          <div class="field">
            <label class="checkbox">
              <input v-model="options.lt" type="checkbox">
              Petit temps
            </label>
          </div>
        </div>
      </div>
      <div class="column is-one-third">
        <div class="control">
          <div class="field">
            <label class="checkbox">
              <input v-model="options.code0" type="checkbox">
              Code 0
            </label>
          </div>
        </div>
      </div>
      <div class="column is-one-third">
        <div class="control">
          <div class="field">
            <label class="checkbox">
              <input v-model="options.gt" type="checkbox">
              Gros temps
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="field is-grouped">
    <p class="control">
      <a class="button is-small is-primary" @click="save">
        Save
      </a>
    </p>
    <p class="control has-icons-left">
      <!-- <input v-model.number="current.delay" class="input is-small" type="text" placeholder="0" style="width:130px"> -->
      <span class="icon is-left">
        <i class="fas fa-clock"></i>
      </span>
    </p>
    <div class="control">
      <div class="field">
        <label class="checkbox">
          <!-- <input v-model="current.stop" type="checkbox"> -->
            Stop
        </label>
      </div>
    </div>
  </div>
  </section>
</template>

<style>

</style>