import { defineStore } from "pinia"
import { ref, toRaw } from "vue"
import { Data } from "../lib/data"
import { Step } from "@phtheirichthys/phtheirichthys"

export interface Params {
  route_steps: Array<Step>,
}

export const useParamsStore = defineStore('params', () => {
  
  const params = ref<Params>(Data.PARAMS.getItem() || {
    route_steps: [
      {until: 4 * 60 * 60, step: 10 * 60},
      {until: 24 * 60 * 60, step: 1 * 60 * 60},
      {until: 9999 * 60 * 60, step: 6 * 60 * 60}]
  })

  function setParams(p: Params) {
    params.value = p
    Data.PARAMS.setItem(toRaw(params.value))
  }

  return {
    params,
    setParams
  }
})
