import { defineStore } from "pinia"
import { Ref, ref } from "vue"
import { Context, Data } from "../lib/data"
import { Point } from "../lib/position"
import { BoatOptions, BoatSettings, Coords } from "@phtheirichthys/phtheirichthys"
import { useRacesStore } from "./races"

interface BoatStatus {
  position: Coords
  settings: BoatSettings
  options: BoatOptions
}

const racesStore = useRacesStore()

export const useNavigateStore = defineStore('navigate', () => {

  console.log("Load Navigate Store")

  const context: Ref<Context | null> = ref(null)

  const boat_status: Ref<BoatStatus | null> = ref(null)

  function load(boatId: string, raceId: string) {
    context.value = {
      boat: boatId,
      race: raceId
    }

    const race = racesStore.get(raceId)

    boat_status.value = Data.BOAT_STATUS.getItem(context.value)
      || {
          position: race?.start || new Point(0, 0),
          settings: {
            heading: { heading: 0 },
            sail: { index: 0, id: 1, auto: false }
          },
          options: {
            lt: false,
            gt: false,
            code0: false,
            foil: false,
            hull: false,
            winch: false,
            stamina: false,   
          }
        }
  }

  return {
    load
  }
})
