import { Polar } from "@phtheirichthys/phtheirichthys"
import { defineStore } from "pinia"
import { ref } from "vue"
import { Data } from "../lib/data"
import * as phtheirichthys from '../lib/phtheirichthys'

interface PolarList {
  id: number,
  label: string,
}

export const usePolarsStore = defineStore('polars', () => {

  let polars = ref(Data.POLARS.getItem<Map<string, Polar>>() ?? new Map<string, Polar>())

  polars.value.forEach((polar) => {
    phtheirichthys.add_polar(polar._id.toString(), polar)
  })

  function add(polar: Polar) {
    let id = polar._id.toString()
    polars.value.set(id, polar)
    Data.POLARS.setItem(polars)

    phtheirichthys.add_polar(id, polar)
  }

  function list(): Array<PolarList> {
    return Array.from(polars.value).map(([, polar]) => ({ id: polar._id, label: polar.label }))
  }

  function importPolar(polarString: string) {
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

  function save(polar: Polar) {
    polars.value.set(polar._id.toString(), polar)

    Data.POLARS.setItem(polars)
  }

  function remove(id: string) {
    polars.value.delete(id)
    console.log("remove", id, polars)

    Data.POLARS.setItem(polars)
  }


  return {
    polars,
    add,
    list,
    importPolar,
    save,
    remove
  }
})
