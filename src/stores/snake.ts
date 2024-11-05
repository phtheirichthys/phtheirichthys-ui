import { Coords, Snake } from "@phtheirichthys/phtheirichthys"
import { defineStore } from "pinia"
import { ref, Ref, toRaw, watch } from "vue"
import * as phtheirichthys from '../lib/phtheirichthys'
import { useNavigateStore } from "./navigate"

export const useSnakeStore = defineStore('snake', () => {

  const navigateStore = useNavigateStore()

  const snake = ref(new Array<Snake>())

  const last: Ref<Coords> = ref(navigateStore.position)
  watch(() => navigateStore.position, () => {
    last.value = navigateStore.position
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
          toRaw(last.value), new Date(), toRaw(navigateStore.settings),
          toRaw(navigateStore.status), {heading: h}).then((snake_result) => {
          
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

  return {
    get,
    last,
  }
})