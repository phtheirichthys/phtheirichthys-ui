import { RouteWaypoint, Snake } from "@phtheirichthys/phtheirichthys"
import { defineStore } from "pinia"
import { ref, Ref, toRaw, watch } from "vue"
import * as phtheirichthys from '../lib/phtheirichthys'
import { useNavigateStore } from "./navigate"

interface Prog {
  start_date: Date,
  waypoints: RouteWaypoint[],
  isTwa: boolean
}

export const useSnakeStore = defineStore('snake', () => {

  const navigateStore = useNavigateStore()

  const snake = ref(new Array<Snake>())
  const progs = ref(new Array<Prog>())

  const last: Ref<RouteWaypoint> = ref({
    from: navigateStore.position,
    duration: 0,
    way_duration: 0,
    boat_settings: navigateStore.settings,
    status: {
      boat_speed: navigateStore.status.boat_speed,
      wind: navigateStore.status.wind,
      foil: navigateStore.status.foil,
      boost: navigateStore.status.boost,
      best_ratio: navigateStore.status.best_ratio,
      ice: false,
      change: false,
      penalties: [],
      remaining_penalties: [],
      stamina: navigateStore.status.stamina,
      remaining_stamina: 0,
    },
  })
  const last_start_date = ref(new Date())
  watch([() => navigateStore.position, () => navigateStore.settings, () => navigateStore.status], () => {
    last.value = {
      from: navigateStore.position,
      duration: 0,
      way_duration: 0,
      boat_settings: navigateStore.settings,
      status: {
        boat_speed: navigateStore.status.boat_speed,
        wind: navigateStore.status.wind,
        foil: navigateStore.status.foil,
        boost: navigateStore.status.boost,
        best_ratio: navigateStore.status.best_ratio,
        ice: false,
        change: false,
        penalties: [],
        remaining_penalties: [],
        stamina: navigateStore.status.stamina,
        remaining_stamina: 0,
      },
    }
    snake.value = new Array<Snake>()
  })

  async function get(h: number): Promise<Snake> {

    return new Promise<Snake>((resolve, reject) => {

      if(!navigateStore.polarId) {
        reject("Polar not set")
      }

      if (snake.value[h]) {
        resolve(snake.value[h])

      } else {

        phtheirichthys.eval_snake(toRaw(navigateStore.polarId!), toRaw(navigateStore.options),
          toRaw(last.value.from), toRaw(last_start_date.value), toRaw(last.value.boat_settings),
          {
            aground: false,
            boat_speed: toRaw(last.value.status.boat_speed),
            wind: toRaw(last.value.status.wind),
            foil: toRaw(last.value.status.foil),
            boost: toRaw(last.value.status.boost),
            best_ratio: toRaw(last.value.status.best_ratio),
            ratio: 0,
            vmgs: undefined,
            penalties: {
              gybe: undefined,
              sail_change: undefined,
              tack: undefined
            },
            stamina: toRaw(last.value.status.stamina),
          }, {heading: h}).then((snake_result) => {
          
            snake.value[h] = snake_result
            resolve(snake.value[h])

        }).catch((e) => {
          let message: string
          if (e instanceof Error) message = e.message
          else message = String(e)

          reject("Error snaking : " + message)
        })
      }
    })

  }

  function addProg(h: number, wp: RouteWaypoint, isTwa: boolean) {
    let wps
    if (isTwa) {
      wps = snake.value[h].twa
    } else {
      wps = snake.value[h].heading
    }

    const prog = { start_date: new Date(last_start_date.value), waypoints: wps.filter((a) => a.duration <= wp.duration), isTwa }
    progs.value.push(prog)
    last_start_date.value.setSeconds(last_start_date.value.getSeconds() + wp.duration)
    last.value = wp // TODO : stocker le status aussi pour envoie lors du calcul du serpent...
    snake.value = new Array<Snake>()
  }

  function setProg(progIndex: number, waypointIndex: number) {
    progs.value = progs.value.slice(0, progIndex + 1)
    progs.value[progs.value.length - 1].waypoints = progs.value[progs.value.length - 1].waypoints.slice(0, waypointIndex + 1)
    last.value = progs.value[progs.value.length - 1].waypoints[progs.value[progs.value.length - 1].waypoints.length - 1]

    let last_prog_date = new Date(progs.value[progs.value.length - 1].start_date)
    last_prog_date.setSeconds(last_prog_date.getSeconds() + last.value.duration)
    last_start_date.value = last_prog_date

    snake.value = new Array<Snake>()
  }

  return {
    get,
    last,
    last_start_date,
    progs,
    addProg,
    setProg,
  }
})