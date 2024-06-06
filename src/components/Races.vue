<script setup lang="ts">
import { computed, ref, Ref } from 'vue';
import Navbar from './Navbar.vue'
import { RaceService } from '../lib/races';
import { Race } from '@phtheirichthys/phtheirichthys';
import draggable from 'vuedraggable'

import Buoy from './Buoy.vue'

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
}

const buoys = computed(() => {
  if(!race)  return

  var buoys = []
  buoys.push({id: "start", name: "start", type: "START", wrap: 0, latlons: [race.value.start]})

  if (race.value.waypoints) {
    race.value.waypoints.forEach(w => {
      console.log(w)
      var type = "WAYPOINT"
      if (w.latlons.length > 1)
        type = "DOOR"
      if (w.name == "end")
        type = "END"

      let latlons = []
      for(var l in w.latlons) {
        let lat = w.latlons[l].lat
        let lon = w.latlons[l].lon //+ (w.wrap ? w.wrap * 360 : 0)
        latlons.push({lat: lat, lon: lon})
      }
      buoys.push({id: w.name, name: w.name, type: type, wrap: 0, latlons: latlons, toAvoid: w.toAvoid, radius: w.radius, custom: false, validated: false})
    });
  }

  console.log(buoys)

  return buoys
})


function reset() {

}

function add() {

  console.log(race.value.waypoints)

  race.value.waypoints.splice(race.value.waypoints.length - 1, 0, {
    name: 'test',
    latlons: [{"lat": 0, "lon": 0}]
  })

  console.log(race.value.waypoints)

}

function moveBuoy(event: any) {
  if (event.moved) {
    console.log({from: event.moved.oldIndex, to: event.moved.newIndex})
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
                <tr v-for="race in races" @click="select(race)">
                  <td>{{ race.name }}</td>
                  <td></td>
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
                    <button v-show="edit" class="button is-small is-white" @click="edit = false">
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
                                <!-- <option v-for="polar in polars" :key="polar.id" :value="polar.id">{{ polar.id }}</option> -->
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

            <!-- <draggable v-model="race.waypoints" draggable=".draggable" handle=".dragger" @change="moveBuoy"> -->
              <Buoy :class="{draggable: edit && buoy.type !== 'START' && buoy.type !== 'END'}" v-for="(buoy, _index) in buoys" :buoy="buoy" :edit="edit"></Buoy>
            <!-- </draggable> -->

          </div>
          <div class="column is-half">
            carte
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

<style>
.navbar-item.is-sun {
  --bulma-navbar-dropdown-item-h:42deg;
  --bulma-navbar-dropdown-item-s:100%;
  --bulma-navbar-dropdown-item-color-l:53%;
}

.navbar-item span.text {
  color: var(--bulma-text-strong);
  padding-left: 0.5em;
}

.navbar-item.is-active.is-sun {
  --bulma-navbar-h:42deg;
  --bulma-navbar-s:100%;
  --bulma-navbar-item-color-l:53%;
}

.navbar-item.is-moon {
  --bulma-navbar-dropdown-item-h:256deg;
  --bulma-navbar-dropdown-item-s:89%;
  --bulma-navbar-dropdown-item-color-l:65%;
}

.navbar-item.is-active.is-moon {
  --bulma-navbar-h:256deg;
  --bulma-navbar-s:89%;
  --bulma-navbar-item-color-l:65%;
}

.navbar-item.is-system {
  --bulma-navbar-dropdown-item-h:153deg;
  --bulma-navbar-dropdown-item-s:53%;
  --bulma-navbar-dropdown-item-color-l:53%;
}

.navbar-item.is-system {
  --bulma-navbar-h:153deg;
  --bulma-navbar-s:53%;
  --bulma-navbar-item-color-l:53%;
}

.navbar-item.is-active {
  background-color: hsla(var(--bulma-navbar-dropdown-item-h),var(--bulma-navbar-dropdown-item-s),var(--bulma-navbar-dropdown-item-color-l),.2);
}
/* 
.bd-cycle {
  --h:var(--bulma-sun-h);
  --s:var(--bulma-sun-s);
  --l:var(--bulma-sun-l);
  border-radius:.5em;
  color:hsl(var(--h),var(--s),var(--l));
  display:flex;
  flex-shrink:0;
  height:2.5rem;
  overflow:hidden;
  position:relative;
  transition-property:background-color;
  width:2.5rem
}
.bd-cycle:hover {
  background-color:hsla(var(--h),var(--s),var(--l),.1)
}
.bd-cycle.is-moon {
  --h:var(--bulma-moon-h);
  --s:var(--bulma-moon-s);
  --l:var(--bulma-moon-l)
}
.bd-cycle.is-moon .bd-cycles {
  transform:translate3d(0,-2.5rem,0)
}
.bd-cycles {
  display:flex;
  flex-direction:column;
  flex-shrink:0;
  height:5rem;
  transition-duration:var(--bulma-duration);
  transition-property:transform;
  width:2.5rem
}
.bd-cycle-moon,
.bd-cycle-sun {
  align-items:center;
  color:inherit;
  display:flex;
  flex-shrink:0;
  height:2.5rem;
  justify-content:center;
  transition:none;
  width:2.5rem
}
.bd-cycle-moon.is-active,
.bd-cycle-sun.is-active {
  opacity:1
}
.bd-cycle-sun.is-active {
  color:var(--sun)
}
.bd-cycle-moon.is-active {
  color:var(--moon)
} */
</style>