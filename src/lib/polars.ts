import { Polar } from "@phtheirichthys/phtheirichthys";
import { Data } from "./data";
import { usePhtheirichthysStore } from '../stores/phtheirichthys'

interface PolarList {
    id: number,
    label: string,
}

export module PolarService {
    let polars: Map<string, Polar>;

    export function init() {
        const phtheirichthys = usePhtheirichthysStore()

        polars = Data.POLARS.getItem() ?? new Map<string, Polar>()

        polars.forEach((polar) => {
            phtheirichthys.add_polar(polar._id.toString(), polar)
        })    
    }

    function add(polar: Polar) {
        const phtheirichthys = usePhtheirichthysStore()

        let id = polar._id.toString()
        console.log(polars)
        polars.set(id, polar)
        Data.POLARS.setItem(polars)

        phtheirichthys.add_polar(id, polar)
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
        add(polar)
    }

    export function save(polar: Polar) {
        polars.set(polar._id.toString(), polar)

        Data.POLARS.setItem(polars)
    }

    export function remove(id: string) {
        polars.delete(id)
        console.log("remove", id, polars)

        Data.POLARS.setItem(polars)
    }
}
