import { Polar, add_polar } from "@phtheirichthys/phtheirichthys";
import { Data } from "./data";

interface PolarList {
    id: number,
    label: string,
}

export module PolarService {
    let polars: Map<string, Polar> = Data.POLARS.getItem() ?? new Map<string, Polar>()

    polars.forEach((polar) => {
        add_polar(polar._id.toString(), polar)
    })

    function addRace(polar: Polar) {
        let id = polar._id.toString()
        console.log(polars)
        polars.set(id, polar)
        console.log(polars)
        Data.POLARS.setItem(polars)
    }

    export function list(): Array<PolarList> {
        return Array.from(polars).map(([, polar]) => ({id: polar._id, label: polar.label}))
    }

    export function importPolar(polarString: string) {
        let imp: any = JSON.parse(polarString)

        var polar: Polar

        if (imp.polar) {
            polar = imp.polar as Polar
        } else if (imp.scriptData && imp.scriptData.polar) {
            polar = imp.scriptData.polar as Polar
        } else {
            polar = JSON.parse(polarString) as Polar
        }
        addRace(polar)
    }

    export function save(polar: Polar) {
        polars.set(polar._id, polar)

        Data.POLARS.setItem(polars)
    }

    export function remove(polar: Polar) {
        polars.delete(polar._id)
        console.log("remove", polar._id, polars)

        Data.POLARS.setItem(polars)
    }
}
