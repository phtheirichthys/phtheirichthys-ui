import { defineStore } from "pinia"
import { Ref, ref, toRaw } from "vue"
import { Context, Data } from "../lib/data"
import { Point } from "../lib/position"
import { BoatOptions, BoatSettings } from "@phtheirichthys/phtheirichthys"
import { useRacesStore } from "./races"
import { useBoatsStore } from "./boats"

export interface BoatStatus {
  position: Point
  settings: BoatSettings
  options: BoatOptions
}

interface PanZoom {
  pan: [number, number],
  zoom: number
}

export const useNavigateStore = defineStore('navigate', () => {

  const racesStore = useRacesStore()
  const boatsStore = useBoatsStore()

  console.log("Load Navigate Store")

  const context: Ref<Context | null> = ref(null)

  const title = ref("")

  const options = ref({
    lt: false,
    gt: false,
    code0: false,
    foil: false,
    hull: false,
    winch: false,
    stamina: false,
  });

  const position = ref(new Point(0, 0))

  const settings: Ref<{
    heading: {heading: number} | {twa: number},
    sail: { index: number, id: number, auto: boolean }
  }> = ref({
    heading: { heading: 0 },
    sail: { index: 0, id: 1, auto: false }
  })

  const status = ref({
    aground: false,
    boat_speed: 10,
    wind: { direction: 30, speed: 15 },
    foil: 0,
    boost: 0,
    best_ratio: 0,
    ratio: 0,
    vmgs: undefined,
    penalties: { gybe: undefined, sail_change: undefined, tack: undefined },
    stamina: 0,
  })

  const panZoom: Ref<PanZoom> = ref({
    pan: [0, 0],
    zoom: 4
  })

  function load(boatId: string, raceId: string) {
    console.log("Load Navigation for ", boatId, raceId)
    context.value = {
      boat: boatId,
      race: raceId
    }

    if (boatsStore.boats.get(boatId)) {
      title.value = boatsStore.boats.get(boatId)?.name + " - "
    } else {
      title.value = ""
    }
    title.value += racesStore.races.get(raceId)?.name

    const race = racesStore.get(raceId)

    options.value = Data.OPTIONS.getItem(context.value) || {
      lt: false,
      gt: false,
      code0: false,
      foil: false,
      hull: false,
      winch: false,
      stamina: false,
    }

    position.value = Data.POSITION.getItem(context.value) || (race ? Point.fromCoords(race.start) : new Point(0, 0))

    settings.value = Data.SETTINGS.getItem(context.value) || {
      heading: { heading: 0 },
      sail: { index: 0, id: 1, auto: false }
    }

    panZoom.value = Data.PAN_ZOOM.getItem(context.value)
      || {
        pan: [0, 0],
        zoom: 4
      }
  }

  function savePanZoom() {
    Data.PAN_ZOOM.setItem(toRaw(panZoom.value), context.value!)
  }

  function setPosition(p: Point) {
    position.value = p
    Data.POSITION.setItem(toRaw(position.value), context.value!)
  }

  function setOptions(o: BoatOptions) {
    options.value = o
    Data.OPTIONS.setItem(toRaw(options.value), context.value!)
  }

  function setSettings(s: BoatSettings) {
    settings.value = s
    Data.SETTINGS.setItem(toRaw(settings.value), context.value!)
  }

  function setPanZoom(pan: [number, number], zoom: number) {
    panZoom.value = {pan, zoom}
    savePanZoom()
  }

  return {
    context,
    title,
    load,
    options,
    position,
    settings,
    status,
    setPosition,
    setOptions,
    setSettings,
    panZoom,
    setPanZoom,
  }
})