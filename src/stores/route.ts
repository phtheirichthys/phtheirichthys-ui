import { defineStore } from "pinia"
import { Ref, ref, toRaw } from "vue"
import { Data } from "../lib/data"
import { RouteResult } from "@phtheirichthys/phtheirichthys"
import { useRacesStore } from './races'
import { useNavigateStore } from './navigate'
import * as phtheirichthys from '../lib/phtheirichthys'

export const useRouteStore = defineStore('route', () => {

  console.log("Load Route Store")

  const navigateStore = useNavigateStore()
  const racesStore = useRacesStore()

  const route: Ref<RouteResult | null> = ref(null)

  async function load() {
    console.log("load route")
    route.value = Data.ROUTE.getItem(navigateStore.context!)
  }

  async function navigate(raceId:string) {
    let race = racesStore.get(raceId)!;
    await phtheirichthys.navigate(toRaw(race), toRaw(navigateStore.options),
      toRaw(navigateStore.position), toRaw(navigateStore.settings),
      toRaw(navigateStore.status),).then((res) => {
      route.value = res
      Data.ROUTE.setItem(res, navigateStore.context!)
    }).catch((e) => {
      console.error("Error navigating", e)
    })
  }

  return {
    route,
    navigate,
    load,
  }
})
