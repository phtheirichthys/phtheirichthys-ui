import { Race } from "@phtheirichthys/phtheirichthys";
import { Data } from "./data";

export module RaceService {
    let races: Map<string, Race> = Data.RACES.getItem() ?? new Map<string, Race>()

    function addRace(race: Race) {
        let id = race.race_id.id.toString()
        if(race.race_id.leg) {
            id += "#" + race.race_id.leg
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
            race_id: {
                id: 0,
                leg: 1
            },
            name: "",
            boat: "",
            start: {lat: 0, lon: 0},
            waypoints: []
        }
    }
}
