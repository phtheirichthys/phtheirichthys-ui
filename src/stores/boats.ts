import { defineStore } from "pinia"
import { ref, toRaw } from "vue"
import { Data } from "../lib/data"

interface Boat {
  id: string,
  name: string,
}

export const useBoatsStore = defineStore('boats', () => {

  console.log("Load Boats Store")

  let boats = ref(Data.BOATS.getItem<Map<string, Boat>>() ?? new Map<string, Boat>())

  function add(boat: Boat) {
    boats.value.set(boat.id, boat)
    Data.BOATS.setItem(toRaw(boats.value))
  }

  function list(): Array<Boat> {
    return Array.from(boats.value).map(([, boat]) => (boat))
  }

  function defaultBoat(): Boat | null {
    if (boats.value.size == 0) {
      return { id: "-", name: "-"}
    } else if (boats.value.size == 1) {
      return boats.value.values().next().value!
    }

    return null
  }

  function save(boat: Boat) {
    boats.value.set(boat.id, boat)
    Data.BOATS.setItem(toRaw(boats.value))
  }

  function remove(id: string) {
    boats.value.delete(id)
    console.log("remove", id, boats)
    Data.BOATS.setItem(toRaw(boats.value))
  }

  return {
    boats,
    add,
    list,
    defaultBoat,
    save,
    remove
  }
})
