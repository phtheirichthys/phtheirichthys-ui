import { defineStore } from "pinia"
import { ref, toRaw } from "vue"
import mitt from 'mitt'
import { Data } from "../lib/data"
import { RouteInfos, RouteResult, RouteWaypoint } from "@phtheirichthys/phtheirichthys"
import { useRacesStore } from './races'
import { useNavigateStore } from './navigate'
import * as phtheirichthys from '../lib/phtheirichthys'
import { useWindStore } from "./wind"

export const emitter = mitt<Events>()

type Events = {
  'highlight': Date,
  'unhighlight': Date
}

export interface PreviousRoute {
  name?: string
  infos: RouteInfos
  way: RouteWaypoint[]
  color: string
  lock: boolean
}

export const useRouteStore = defineStore('route', () => {

  console.log("Load Route Store")

  const navigateStore = useNavigateStore()
  const racesStore = useRacesStore()
  const windStore = useWindStore()

  const route = ref<RouteResult | null>(null)
  const previousRoutes = ref<Array<PreviousRoute>>([])

  async function load() {
    console.log("load route")
    route.value = Data.ROUTE.getItem(navigateStore.context!, (val) => {
      if (val) {
        val.infos.start = new Date(val.infos.start)
      }
    })

    previousRoutes.value = Data.PREVIOUS_ROUTES.getItem(navigateStore.context!, (val) => {
      if (val) {
        for (let route of val) {
          route.infos.start = new Date(route.infos.start)
        }
      }
    }) || []
  }

  async function navigate(raceId:string) {
    let race = racesStore.get(raceId)!;
    await windStore.isReady
    await phtheirichthys.navigate(toRaw(race), toRaw(windStore.provider), toRaw(navigateStore.options),
      toRaw(navigateStore.position), toRaw(navigateStore.position.start_time), toRaw(navigateStore.settings),
      toRaw(navigateStore.status),)
    .then((res) => {
      if (route.value) {
        previousRoutes.value = previousRoutes.value.filter((r) => r.lock)
        previousRoutes.value.push({infos: route.value.infos, way: route.value.way, color: "#777777", lock: false})
        Data.PREVIOUS_ROUTES.setItem(toRaw(previousRoutes.value), navigateStore.context!)
      }
      route.value = res
      Data.ROUTE.setItem(res, navigateStore.context!)
    }).catch((e) => {
      console.error("Error navigating", e)
    })
  }

  async function save() {
    Data.PREVIOUS_ROUTES.setItem(toRaw(previousRoutes.value), navigateStore.context!)
  }

  return {
    route,
    previousRoutes,
    navigate,
    load,
    save,
  }
})
