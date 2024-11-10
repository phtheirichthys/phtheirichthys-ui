<script setup lang="ts">
import { ref, watch } from 'vue';
import { dd2dms, dms2dd } from '../../lib/utils'
import 'leaflet-rotatedmarker'

const props = defineProps<{
  dd: number,
  pasteStatus: -1 | 0 | 1,
  type: "latitude" | "longitude"
}>()
const emit = defineEmits(['wrap', 'change'])

const dms = ref(dd2dms(props.dd))

watch(
  () => props.dd,
  (dd) => {
    if (dd !== dms2dd(dms.value)) {
      dms.value = dd2dms(dd)
    }
  }
)

watch(
  dms,
  () => {
    emit('change', dms2dd(dms.value))
  },
  { deep: true }
)
</script>

<template>
  <div class="columns is-0">
    <div class="column">
      <div class="field is-grouped">
        <div class="field has-addons">
          <p class="control">
            <input v-model.number="dms.d" class="input is-small" :class="{'is-success': props.pasteStatus === 1, 'is-danger': props.pasteStatus === -1}" type="text" placeholder="41" style="width:40px">
          </p>
          <p class="control is-clickable" @click="dms.p = -1 * dms.p">
            <a class="button is-small" :class="{'is-static': props.pasteStatus === 0, 'is-success': props.pasteStatus === 1, 'is-danger': props.pasteStatus === -1}">°
              <span v-if='props.type === "latitude" && dms.p === 1'>&nbsp;N</span>
              <span v-if='props.type === "latitude" && dms.p === -1'>&nbsp;S</span>
              <span v-if='props.type === "longitude" && dms.p === 1'>&nbsp;E</span>
              <span v-if='props.type === "longitude" && dms.p === -1'>&nbsp;W</span>
            </a>
          </p>
          <p class="control">
            <input v-model.number="dms.m" class="input is-small" :class="{'is-success': props.pasteStatus === 1, 'is-danger': props.pasteStatus === -1}" type="text" placeholder="42" style="width:40px">
          </p>
          <p class="control">
            <a class="button is-small" :class="{'is-static': props.pasteStatus === 0, 'is-success': props.pasteStatus === 1, 'is-danger': props.pasteStatus === -1}">'</a>
          </p>
          <p class="control">
            <input v-model.number="dms.s" class="input is-small" :class="{'is-success': props.pasteStatus === 1, 'is-danger': props.pasteStatus === -1}" type="text" placeholder="43" style="width:40px">
          </p>
          <p class="control">
            <a class="button is-small" :class="{'is-static': props.pasteStatus === 0, 'is-success': props.pasteStatus === 1, 'is-danger': props.pasteStatus === -1}">''</a>
          </p>
        </div>
      </div>
    </div>
    <div v-if='type === "longitude"' class="column">
      <div class="help field is-grouped">
        <div class="field has-addons">
          <p class="control">
            <button class="button is-small" :class="{'is-info': dms.wrap === -1}" @click="emit('wrap', -1)" style="padding: 5px"><i class="fas fa-globe-europe"></i><i class="fas fa-globe-europe move-left" style="opacity: 20%"></i><i class="fas fa-globe-europe move-left" style="opacity: 20%"></i></button>
          </p>
          <p class="control">
            <button class="button is-small" :class="{'is-info': dms.wrap === 0}" @click="emit('wrap', 0)" style="padding: 5px"><i class="fas fa-globe-europe" style="opacity: 20%"></i><i class="fas fa-globe-europe move-left"></i><i class="fas fa-globe-europe move-left" style="opacity: 20%"></i></button>
          </p>
          <p class="control">
            <button class="button is-small" :class="{'is-info': dms.wrap === 1}" @click="emit('wrap', 1)" style="padding: 5px"><i class="fas fa-globe-europe" style="opacity: 20%"></i><i class="fas fa-globe-europe move-left" style="opacity: 20%"></i><i class="fas fa-globe-europe move-left"></i></button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.move-left {
  margin-left: -7px;
}
</style>