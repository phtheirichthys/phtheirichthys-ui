<script setup lang="ts">
import { Ref, ref, toRaw, watch } from 'vue';
import { useNavigateStore } from '../../stores/navigate'
import * as utils from '../../lib/utils'
import Dms from './Dms.vue'

const navigateStore = useNavigateStore()

const options = ref(toRaw(navigateStore.options))
const delay = ref(0)
const position = ref(toRaw(navigateStore.position))
const settings = ref(toRaw(navigateStore.settings))
const twa = ref('twa' in settings.value.heading)
const heading = ref(twa.value ? utils.twa(settings.value.heading, navigateStore.status.wind.direction) : utils.heading(settings.value.heading, navigateStore.status.wind.direction))

const pasteStatus: Ref<{latitude: -1|0|1, longitude: -1|0|1, heading: -1|0|1}> = ref({
  latitude: 0,
  longitude: 0,
  heading: 0,
})

watch([() => settings.value.heading, () => navigateStore.status.wind.direction], ([h, twd]) => {
  twa.value = 'twa' in settings.value.heading
  if (twa.value) {
    heading.value = utils.twa(h, twd)
  } else {
    heading.value = utils.heading(h, twd)
  }
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

function wrap(value: number) {
  while (position.value.lon <= -180) {
    position.value.lon += 360
  }
  while (position.value.lon > 180) {
    position.value.lon -= 360
  }
  position.value.lon += 360 * value
  console.log("<", position.value.lon)
}

function save() {
  if (twa.value === true) {
    settings.value.heading = {twa: heading.value}
  } else {
    settings.value.heading = {heading: heading.value}
  }

  navigateStore.setPosition(toRaw(position.value), toRaw(delay.value))
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

const pasteLatlon = ref("")

function paste(event: ClipboardEvent) {
  var clipboard = event.clipboardData?.getData("text/plain") || ""
  pasteData(clipboard)
  event.preventDefault()
}

function pasteData(clipboard: string) {
  let wrap = utils.dd2dms(position.value.lon).wrap

  let _pasteStatus: {latitude: -1|0|1, longitude: -1|0|1, heading: -1|0|1} = {
    latitude: -1,
    longitude: -1,
    heading: -1,
  }

  let latRe = /([0-1]?[0-9]{2}) ?°(N|S) ([0-9]{2}) ?(?:'|‘) ?([0-9]{2})"/
  const lat = clipboard.match(latRe);
  if(lat) {
    position.value.lat = utils.dms2dd({p: lat[2] === "N" ? 1 : -1, d: parseFloat(lat[1]), m: parseFloat(lat[3]), s: parseFloat(lat[4]), wrap: 0})
    _pasteStatus.latitude = 1
  }

  let lonRe = /([0-1]?[0-9]{2}) ?°(E|W) ([0-9]{2}) ?(?:'|‘) ?([0-9]{2})"/
  const lon = clipboard.match(lonRe);
  if(lon) {
    position.value.lon = utils.dms2dd({p: lon[2] === "E" ? 1 : -1, d: parseFloat(lon[1]), m: parseFloat(lon[3]), s: parseFloat(lon[4]), wrap})
    _pasteStatus.longitude = 1
  }

  let headingRe = /Hdg:([0-3]?[0-9]{2})/
  const heading = clipboard.match(headingRe);
  if(heading) {
    settings.value.heading = {heading: parseFloat(heading[1])}
    _pasteStatus.heading = 1
  }


  let latReDash = /([0-1]?[0-9]?[0-9])°([0-9]{2})'([0-9]{2}(\.[0-9]{2})?)"(N|S)/
  const latDash = clipboard.match(latReDash);
  if(latDash) {
    position.value.lat = utils.dms2dd({p: latDash[5] === "N" ? 1 : -1, d: parseFloat(latDash[1]), m: parseFloat(latDash[2]), s: parseFloat(latDash[3]), wrap: 0})
    _pasteStatus.latitude = 1
  }

  let lonReDash = /([0-1]?[0-9]?[0-9])°([0-9]{2})'([0-9]{2}(\.[0-9]{2})?)"(E|W)/
  const lonDash = clipboard.match(lonReDash);
  if(lonDash) {
    position.value.lon = utils.dms2dd({p: lonDash[5] === "E" ? 1 : -1, d: parseFloat(lonDash[1]), m: parseFloat(lonDash[2]), s: parseFloat(lonDash[3]), wrap})
    _pasteStatus.longitude = 1
  }

  pasteStatus.value = _pasteStatus

  setTimeout(() => {
    pasteStatus.value = {
      latitude: 0,
      longitude: 0,
      heading: 0
    }
  }, 30000)

  return _pasteStatus.latitude == 1 && _pasteStatus.longitude == 1
}

</script>

<template>
  <h1 class="leaflet-sidebar-header">
    {{ navigateStore.title }}
    <div class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></div>
  </h1>
  <section class="section">
    <div class="field is-grouped">
      <div class="field">
        <label class="label">Cap</label>
        <div class="field has-addons">
          <p class="control">
            <button v-if="twa" class="button is-small" @click="setTwa(false)"><span class="icon is-small"><i class="fas fa-wind"></i></span></button>
            <button v-else class="button is-small" @click="setTwa(true)"><span class="icon is-small"><i class="far fa-compass"></i></span></button>
          </p>
          <p class="control">
            <input v-model.number="heading" class="input is-small" :class="{'is-success': pasteStatus.heading === 1, 'is-danger': pasteStatus.heading === -1}" type="text" placeholder="41" style="width:45px">
          </p>
          <p class="control">
            <a class="button is-static is-small">°</a>
          </p>
        </div>
      </div>
      <div class="field">
        <label class="label">Sail</label>
        <div class="control">
          <div class="select is-small">
            <select v-model.number="settings.sail.id" style="width:100px">
              <option value="1">Jib</option>
              <option value="2">>Spi</option>
              <option value="4">Génois Léger</option>
              <option value="7">Spi Léger</option>
              <option value="5">Code 0</option>
              <option value="3">Trinquette</option>
              <option value="6">Spi Lourd</option>
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
      <div class="field">
        <label class="label">Stamina</label>
        <div class="control">
          <input v-model.number="settings.stamina" class="input is-small" type="text" placeholder="110" style="width:45px">
        </div>
      </div>
    </div>
    <label class="label">Copier - Coller</label>
    <div class="field is-grouped">
      <p class="control">
        <input v-model="pasteLatlon" @paste="paste" class="input is-small" type="text">
      </p>
    </div>
    <label class="label">Latitude</label>
    <Dms :dd="position.lat" :pasteStatus="pasteStatus.latitude" type="latitude" @change='(lat) => change("latitude", lat)' />
    <label class="label">Longitude</label>
    <Dms :dd="position.lon" :pasteStatus="pasteStatus.longitude" type="longitude" @change='(lon) => change("longitude", lon)' @wrap="wrap" />
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
      <div class="column is-one-third">
        <div class="control">
          <div class="field">
            <label class="checkbox">
              <input v-model="options.magic_furler" type="checkbox">
              Magic Furler
            </label>
          </div>
        </div>
      </div>
      <div class="column is-one-third">
        <div class="control">
          <div class="field">
            <label class="checkbox">
              <input v-model="options.pouf" type="checkbox">
              Pouf
            </label>
          </div>
        </div>
      </div>
      <div class="column is-one-third">
        <div class="control">
          <div class="field">
            <label class="checkbox">
              <input v-model="options.veste" type="checkbox">
              Veste
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
      <input v-model.number="delay" class="input is-small" type="text" placeholder="0" style="width:130px">
      <span class="icon is-left">
        <i class="fas fa-clock"></i>
      </span>
    </p>
  </div>
  </section>
</template>

<style scoped>
@media (max-height: 460px) {
  .bottom {
    visibility: hidden;
    height: 0px;
  }
}

@media (min-width: 768px) {
  .leaflet-sidebar-left ~ .notification {
    transition: left 500ms;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .leaflet-sidebar-left.extended ~ .leaflet-control-container .leaflet-left {
    left: 400px;
  }
  .leaflet-sidebar-left.extended ~ .notification {
    left: 456px;
  }
  .leaflet-sidebar-left ~ .notification {
    left: 371px;
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .leaflet-sidebar-left.extended ~ .leaflet-control-container .leaflet-left {
    left: 600px;
  }
  .leaflet-sidebar-left.extended ~ .notification {
    left: 656px;
  }
  .leaflet-sidebar-left ~ .notification {
    left: 456px;
  }
}

@media (min-width: 1200px) {
  .leaflet-sidebar-left.extended ~ .leaflet-control-container .leaflet-left {
    left: 900px;
  }
  .leaflet-sidebar-left.extended ~ .notification {
    left: 956px;
  }
  .leaflet-sidebar-left ~ .notification {
    left: 556px;
  }
}

.leaflet-sidebar-left.collapsed ~ .notification {
  left: 106px;
}

@media (min-width: 768px) {
  .leaflet-sidebar.extended {
    top: 10px;
    bottom: 10px;
    transition: width 500ms; } }
@media (min-width: 768px) and (max-width: 991px) {
  .leaflet-sidebar.extended {
    width: 390px;
    max-width: 390px; } }
@media (min-width: 992px) and (max-width: 1199px) {
  .leaflet-sidebar.extended {
    width: 590px;
    max-width: 590px; } }
@media (min-width: 1200px) {
  .leaflet-sidebar.extended {
    width: 890px;
    max-width: 890px; } }

.leaflet-sidebar-tabs .button {
  padding: 0px;
  border: 0px;
}

.leaflet-sidebar-pane .section {
  padding: 10px 0px 0px;
}

.leaflet-control-scale.leaflet-control {
  margin-left: 25px;
}

.leaflet-sidebar-tabs > li.active, .leaflet-sidebar-tabs > ul > li.on,
.leaflet-sidebar-tabs > li.active, .leaflet-sidebar-tabs > ul > li.on:hover {
  color: #0074d9;
}
</style>
