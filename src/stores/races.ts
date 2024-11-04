import { defineStore } from "pinia"
import { ref, toRaw } from "vue"
import { Data } from "../lib/data"
import { Race } from "@phtheirichthys/phtheirichthys"
import { Box } from "../lib/utils"

export const useRacesStore = defineStore('races', () => {

  console.log("Load Races Store")

  const races = ref(Data.RACES.getItem<Map<string, Race>>() ?? new Map<string, Race>())

  function add(race: Race) {
    let id = race.id.toString()
    if (race.leg) {
      id += "-" + race.leg
    }
    console.log(races)
    races.value.set(id, race)
    console.log(races)
    Data.RACES.setItem(toRaw(races.value))
  }

  function list(): Array<Race> {
    console.log("races", races, races.value)
    return Array.from(races.value).map(([, race]) => (race))
  }

  function importRace(raceString: string) {
    let race = JSON.parse(raceString) as Race
    add(race)
  }

  function newRace(): Race {
    return {
      id: "",
      leg: 1,
      name: "",
      boat: "",
      start: { lat: 0, lon: 0 },
      buoys: []
    }
  }

  function save(race: Race) {
    if (race.id && race.id !== "") {
      races.value.set(race.id, race)
      console.log(races.value)
      Data.RACES.setItem(toRaw(races.value))
    }
  }

  function remove(raceId: string) {
    if (races.value.has(raceId)) {
      races.value.delete(raceId)
      Data.RACES.setItem(toRaw(races.value))
    }
  }

  function get(id: string): Race | null {
    console.log(id, races)

    return races.value.get(id) || null
  }

  function box(raceId: string) : Box {
    let box = new Box()
    const race = get(raceId)
    if (race) {
      box.add(race.start)
      for (let buoy of race.buoys) {
        switch (buoy.type) {
          case "Door":
            box.add(buoy.port)
            box.add(buoy.starboard)
            box.add(buoy.departure)
            box.add(buoy.destination)
            break
          case "Waypoint":
            box.add(buoy.destination)
            break
          case "Zone":
            box.add(buoy.destination)
            break
        }
      }
    }
    return box
  }

  return {
    races,
    add,
    list,
    importRace,
    newRace,
    save,
    remove,
    get,
    box,
  }
})
