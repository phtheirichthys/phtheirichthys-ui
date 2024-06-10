import { Race } from "@phtheirichthys/phtheirichthys";
import { Data } from "./data";

export module RaceService {
    let races: Map<string, Race> = Data.RACES.getItem() ?? new Map<string, Race>()

    function addRace(race: Race) {
        let id = race.id.toString()
        if(race.leg) {
            id += "#" + race.leg
        }
        console.log(races)
        races.set(id, race)
        console.log(races)
        Data.RACES.setItem(races)
    }

    export function list(): Array<Race> {
        return Array.from(races).map(([, race]) => (race))
    }

    export function importRace(raceString: string) {
        let race = JSON.parse(raceString) as Race
        addRace(race)
    }

    export function newRace(): Race {
        return {
            id: "",
            leg: 1,
            name: "",
            boat: "",
            start: {lat: 0, lon: 0},
            buoys: []
        }
    }

    export function save(race: Race) {
        races.set(race.id, race)

        Data.RACES.setItem(races)
    }

    export function remove(race: Race) {
        console.log("remove", race)
        races.delete(race.id)
        console.log("remove", race.id, races)

        Data.RACES.setItem(races)
    }

    export function get(id: string): Race | null {
        return races.get(id) || null
    }
}
