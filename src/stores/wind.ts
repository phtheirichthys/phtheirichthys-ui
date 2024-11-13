import { defineStore } from "pinia"
import { computed, ref, Ref, toRaw } from "vue"
import * as phtheirichthys from '../lib/phtheirichthys'
import { Coords, Wind } from "@phtheirichthys/phtheirichthys"

export const useWindStore = defineStore('wind', () => {

  console.log("Load Wind Store")

  const ready = ref(false)

  const provider = ref("noaa")

  const status = ref<any | null>(null)


  let windResolve: () => void;
  let isReady = new Promise<void>((resolve) => {
      windResolve = resolve;
  })

  phtheirichthys.isLoaded().then(() => {
    phtheirichthys.add_wind_provider(provider.value).then(async () => {
      await refresh()
      console.log("Wind provider " + provider.value + " is ready")
      ready.value = true
      windResolve()
    }).catch((e) => {
      console.log("Error adding wind provider", e)
    })
  })

  async function getWind(point: Coords, moment: Date = new Date()): Promise<Wind> {
    await isReady
    return phtheirichthys.get_wind(provider.value, point, moment)
  }

  function drawWind(canvas: OffscreenCanvas, m: Date, x: number, y: number, z: number, width: number, height: number) {
    if (ready.value === true) {
      phtheirichthys.draw_wind(toRaw(provider.value), canvas, m, x, y, z, width, height)
    }
  }

  async function refresh() {
    console.log("refresh wind status")
    status.value = await phtheirichthys.get_wind_provider_status(provider.value)
    console.log("the new status", status, status.value)
  }

  setInterval(refresh, 60000)

  return {
    provider,
    status,
    isReady,
    getWind,
    drawWind,
  }
})