import { defineStore } from "pinia"
import { ref, toRaw } from "vue"
import { Data } from "../lib/data"
import { Buoy, Coords, Race } from "@phtheirichthys/phtheirichthys"
import { Box, computeDestinationAndDeparture } from "../lib/utils"

export const useRacesStore = defineStore('races', () => {

  console.log("Load Races Store")

  const races = ref(Data.RACES.getItem<Map<string, Race>>() ?? new Map<string, Race>())
  function add(race: Race) {
    let id = race.id.toString()
    if (race.leg && race.leg > 0) {
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
    const imported: any = JSON.parse(raceString)

    if ('checkpoints' in imported) {
      console.log("import from vr")

      let buoys: Array<Buoy> = imported.checkpoints
      .filter((checkpoint: any) => checkpoint.cvo !== true)
      .map((checkpoint: any) => {
        let port, starboard: Coords
        if (checkpoint.side === "port") {
          port = checkpoint.start
          starboard = checkpoint.end
        } else {
          port = checkpoint.end
          starboard = checkpoint.start
        }

        let dAndD = computeDestinationAndDeparture(port, starboard)

        return {
          type: "Door",
          name: checkpoint.group.toString(),
          port,
          starboard,
          departure: dAndD.departure,
          destination: dAndD.destination,
          to_avoid: [],
          validated: false,
        }
      })

      buoys.push({
        type: "Zone",
        name: "END",
        destination: { lat: imported.end.lat, lon: imported.end.lon },
        radius: imported.end.radius,
        to_avoid: [],
        validated: false
      })

      let race = {
        id: imported.name.toLowerCase()
        .replace(/[éèê]/g, "e")
        .replace(/[àâ]/g, "a")
        .replace(/[îï]/g, "i")
        .replace(/[^a-z0-9]/g, "-"),
        name: imported.name,
        leg: 0,
        boat: imported.boat.polar_id.toString(),
        stamina: imported.stamina,
        start_time: imported.start.date,
        end_time: imported.close.date,
        start: {lat: imported.start.lat, lon: imported.start.lon},
        buoys: buoys,
        ice_limits: imported.ice_limits,
        restricted_zones: imported.restrictedZones,
      }

      console.log("the race", race)
      add(race)
    } else {
      let race = imported as Race
      console.log("race to import", race, imported)
      add(race)
    }
  }

  function newRace(): Race {
    return {
      id: "",
      leg: 1,
      name: "",
      boat: "",
      start: { lat: 0, lon: 0 },
      buoys: [],
      restricted_zones: [],
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
