<script setup lang="ts">
import { Ref, ref } from 'vue';
import { RaceService } from '../lib/races';
import Navbar from './Navbar.vue'
import { useRouter } from 'vue-router';

const router = useRouter()

const boat: Ref<string> = ref("-")
const race: Ref<string | null> = ref(null)

function navigate() {
  router.push({ name: 'navigate', params: { boat: boat.value, race: race.value } })
}

</script>

<template>

  <section class="hero is-fullheight">
    <div class="hero-head">
      <Navbar />
    </div>

    <div class="hero-body is-flex-direction-column">
      <div class="columns">
        <div class="column">
          <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
            <thead>
              <tr>
                <th class="is-fullwidth"><abbr title="Race">Boat</abbr></th>
              </tr>
            </thead>
            <tbody>
              <tr :class="{'is-selected':b.id === boat}" v-for="b in RaceService.list()" @click="boat = b.id">
                <td>{{ b.name }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="column">
          <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
            <thead>
              <tr>
                <th class="is-fullwidth"><abbr title="Race">Race</abbr></th>
              </tr>
            </thead>
            <tbody>
              <tr :class="{'is-selected':r.id === race}" v-for="r in RaceService.list()" @click="race = r.id">
                <td>{{ r.name }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="field">
        <p class="control">
          <button class="button is-primary" @click="navigate()">Navigate</button>
        </p>
      </div>
    </div>
  </section>

</template>

<style scoped></style>