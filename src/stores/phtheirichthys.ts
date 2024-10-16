import { defineStore } from 'pinia'
import mitt from 'mitt'
import { BoatConfig, Point } from '../lib/position'
import { v4 as uuidv4 } from 'uuid';
import * as phtheirichthys from '@phtheirichthys/phtheirichthys'

import MyWorker from '../worker?sharedworker&inline'
import { Wind, WindService } from '../lib/wind';
import { RaceService } from '../lib/races';

export const emitter = mitt<Events>()

type Events = {
  'wind-provider-status': any,
  'navigation': any
}

export const usePhtheirichthysStore = defineStore('phtheirichthys', () => {

  let worker = new MyWorker()

  function init() {
    console.log("new my worker")
    worker = new MyWorker()
    worker.onerror = (error) => {
      console.error(error)
    }
    worker.port.onmessage = (message) => {
      const { type, uuid, data } = message.data
  
      console.debug("Worker", "on message", type, uuid, data)
  
      switch (type) {
        case "wind-provider-status":
          emitter.emit(type, data)
          break
        case "navigation":
          emitter.emit(type, data)
          break
      }
    }
    worker.port.onmessageerror = (message) => {
      console.error("On Message Error", message)
    }
    console.log("Start Port", worker, worker.port)
  
    worker.port.start()
  
    add_wind_provider()  
  }

  function terminate() {
    worker.port.close()
  }

  function add_wind_provider() {
    console.log("add wind provider")
    worker.port.postMessage({ type: "add-wind-provider" })
  }

  // function get_wind_provider_status(provider: string) {
  //   worker.port.postMessage({ type: "get-wind-provider-status", provider })
  // }

  async function get_wind(point: Point) {
    return new Promise<phtheirichthys.Wind>((resolve, reject) => {
      if (!worker) {
        reject()
        return
      }

      const request_uuid = uuidv4()
      const handler = (message: MessageEvent<any>) => {
        const { uuid, data } = message.data

        if (uuid === request_uuid) {
          worker.port.removeEventListener("message", handler)
          resolve(data)
        }
      }
      worker.port.addEventListener("message", handler)

      worker.port.postMessage({ type: "get-wind", uuid: request_uuid, provider: WindService.get_provider(), moment: new Date(), point: point })
    })
  }

  function add_land_provider() {
    console.log("add land provider")
    worker.port.postMessage({ type: "add-land-provider" })
  }

  function draw_land(canvas: OffscreenCanvas, x: number, y: number, z: number, width: number, height: number) {
    worker.port.postMessage({ type: "draw-land", canvas, provider: "vr", coords: { x, y, z }, size: { width, height } }, [canvas])
  }

  async function eval_snake(heading: phtheirichthys.Heading) {

    let boat_settings = {
      heading: { twa: 90 },
      sail: {
        index: 0,
        id: 1,
        auto: false,
      }
    }

    let status = {
      aground: false,
      boat_speed: 0,
      wind: new Wind(0, 0),
      foil: 0,
      boost: 0,
      best_ratio: 0,
      ratio: 0,
      vmgs: undefined,
      penalties: {
        gybe: undefined,
        sail_change: undefined,
        tack: undefined,
      },
      stamina: 1,
    }

    return new Promise<phtheirichthys.SnakeResult>((resolve, reject) => {

      if (!worker) {
        reject()
        return
      }

      const request_uuid = uuidv4()
      const handler = (message: MessageEvent<any>) => {
        const { uuid, data } = message.data

        if (uuid === request_uuid) {
          worker.port.removeEventListener("message", handler)
          resolve(data)
        }
      }
      worker.port.addEventListener("message", handler)


      worker.port.postMessage({
        type: "eval-snake", uuid: request_uuid,
        route_request: { from: { lat: 0, lon: 0 }, start_time: new Date().toISOString(), boat_settings, status },
        params: {
          max_duration: 48,
          polar: "19",
          wind_provider: WindService.get_provider(),
          boat_options: {
            lt: false,
            gt: false,
            code0: false,
            foil: false,
            hull: false,
            winch: false,
            stamina: false,
          }
        },
        heading
      })
    })
  }

  function add_polar(name: string, polar: phtheirichthys.Polar) {
    worker.port.postMessage({ type: "add-polar", name, polar })
  }

  function test_webgpu() {
    worker.port.postMessage({ type: "test-webgpu" })
  }

  async function navigate(race_id: string, boat_config: BoatConfig) {
    let race: phtheirichthys.Race = RaceService.get(race_id)!;

    let request = {
      from: { lat: 0, lon: 0 },
      start_time: new Date().toISOString(),
      boat_settings: boat_config.settings,
      status: boat_config.status
    }

    return new Promise<phtheirichthys.RouteResult>((resolve) => {
      const request_uuid = uuidv4()
      const handler = (message: MessageEvent<any>) => {
        const { uuid, data } = message.data

        if (uuid === request_uuid) {
          worker.port.removeEventListener("message", handler)
          resolve(data)
        }
      }
      worker.port.addEventListener("message", handler)


      worker.port.postMessage({
        type: "navigate", uuid: request_uuid,
        wind_provider: WindService.get_provider(),
        polar_id: "19",
        race,
        boat_options: boat_config.options,
        request
      })
    })

  }


  return {
    init,
    terminate,
    add_land_provider,
    add_wind_provider,
    draw_land,
    get_wind,
    navigate,
    test_webgpu,
    eval_snake,
    add_polar,
  }
})
