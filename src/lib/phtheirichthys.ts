import mitt from 'mitt'
import { Point } from '../lib/position'
import { v4 as uuidv4 } from 'uuid';

import * as phtheirichthys from '@phtheirichthys/phtheirichthys/phtheirichthys'
import PhtheirichthysWorker from '../worker?sharedworker&inline'
import wasmUrl from '@phtheirichthys/phtheirichthys/phtheirichthys_bg.wasm?url'

export const emitter = mitt<Events>()

type Events = {
  'wind-provider-status': any,
  'navigation': any
}


let worker = new PhtheirichthysWorker()

export function init() {
    worker.port.postMessage({ type: "load", wasmUrl: window.location.protocol + "//" + window.location.host + wasmUrl })

    worker.onerror = (error: any) => {
        console.log("worker onerror", error)
    }
    worker.port.onmessage = (message) => {
        const { type, data } = message.data
    
        switch (type) {
        case "wind-provider-status":
            emitter.emit(type, data)
            break
        }
    }
    worker.port.onmessageerror = (message) => {
        console.error("On Message Error", message)
    }
}

export function terminate() {
    worker.port.close()
}

export function add_wind_provider(provider: string) {
    console.log("Add wind provider", provider)

    return new Promise<void>((resolve, reject) => {
        const request_uuid = uuidv4()
        const handler = (message: MessageEvent<any>) => {
            const { type, uuid } = message.data

            if (uuid === request_uuid) {
                worker.port.removeEventListener("message", handler)
                if (type === "add-wind-provider") {
                    resolve()
                } else {
                    const { error } = message.data
                    reject(error)
                }
            }
        }
        worker.port.addEventListener("message", handler)

        const message = {
            type: "add-wind-provider", uuid: request_uuid,
            provider,
        }

        worker.port.postMessage(message)
    })
}

export function get_wind_provider_status(provider: string) {
    console.log("Get wind provider status", provider)

    return new Promise<void>((resolve, reject) => {
        const request_uuid = uuidv4()
        const handler = (message: MessageEvent<any>) => {
            const { type, uuid, data } = message.data

            if (uuid === request_uuid) {
                worker.port.removeEventListener("message", handler)
                if (type === "wind-provider-status") {
                    resolve(data)
                } else {
                    const { error } = message.data
                    reject(error)
                }
            }
        }
        worker.port.addEventListener("message", handler)

        const message = {
            type: "get-wind-provider-status", uuid: request_uuid, provider,
        }

        worker.port.postMessage(message)
    })
}

export async function get_wind(provider: string, point: phtheirichthys.Coords, moment: Date = new Date()) {
    return new Promise<phtheirichthys.Wind>((resolve) => {
        const request_uuid = uuidv4()
        const handler = (message: MessageEvent<any>) => {
            const { uuid, data } = message.data

            if (uuid === request_uuid) {
                worker.port.removeEventListener("message", handler)
                resolve(data)
            }
        }
        worker.port.addEventListener("message", handler)

        worker.port.postMessage({ type: "get-wind", uuid: request_uuid, provider, moment, point: point })
    })
}

export function add_land_provider() {
    console.log("add land provider")
    worker.port.postMessage({ type: "add-land-provider" })
}

export function draw_land(canvas: OffscreenCanvas, x: number, y: number, z: number, width: number, height: number) {
    worker.port.postMessage({ type: "draw-land", canvas, provider: "vr", coords: { x, y, z }, size: { width, height } }, [canvas])
}

export function draw_wind(wind_provider: string, canvas: OffscreenCanvas, m: Date, x: number, y: number, z: number, width: number, height: number) {
    worker.port.postMessage({ type: "draw-wind", canvas, provider: wind_provider, moment: m, coords: { x, y, z }, size: { width, height } }, [canvas])
}

export async function eval_snake(polarId: string, wind_provider: string, boat_options: phtheirichthys.BoatOptions, from: phtheirichthys.Coords, start_time: Date, boat_settings: phtheirichthys.BoatSettings, status: phtheirichthys.BoatStatus, heading: phtheirichthys.Heading) {

    return new Promise<phtheirichthys.Snake>((resolve, reject) => {

        const request_uuid = uuidv4()
        const handler = (message: MessageEvent<any>) => {
            const { type, uuid, data } = message.data

            if (uuid === request_uuid) {
                worker.port.removeEventListener("message", handler)
                if (type === "snake") {
                    resolve(data)
                } else {
                    const { error } = message.data
                    reject(error)
                }
            }
        }
        worker.port.addEventListener("message", handler)


        worker.port.postMessage({
            type: "eval-snake", uuid: request_uuid,
            route_request: { from, start_time: start_time.toISOString(), boat_settings, status },
            params: {
                max_duration: 48,
                polar: polarId,
                wind_provider,
                boat_options,
            },
            heading
        })
    })
}

export function add_polar(name: string, polar: phtheirichthys.Polar) {
    console.log("Load polar", polar._id)
    worker.port.postMessage({ type: "add-polar", name, polar })
}

export async function test_webgpu() {

    return new Promise<phtheirichthys.RouteResult>((resolve, reject) => {
        const request_uuid = uuidv4()
        const handler = (message: MessageEvent<any>) => {
        const { type, uuid, data } = message.data

        if (uuid === request_uuid) {
            worker.port.removeEventListener("message", handler)
            if (type === "test-webgpu") {
                resolve(data)
            } else {
                const { error } = message.data
                reject(error)
            }
        }
        }
        worker.port.addEventListener("message", handler)

        worker.port.postMessage({ type: "test-webgpu", uuid: request_uuid })
    })

}

export async function navigate(race: phtheirichthys.Race, wind_provider: string, options: phtheirichthys.BoatOptions,  position: Point, settings: phtheirichthys.BoatSettings, status: phtheirichthys.BoatStatus) {

    console.log("navigate : ", options, position, settings, status)

    let request = {
        from: position,
        start_time: new Date().toISOString(),
        boat_settings: settings,
        status: status,
    }

    return new Promise<phtheirichthys.RouteResult>((resolve, reject) => {
        const request_uuid = uuidv4()
        const handler = (message: MessageEvent<any>) => {
        const { type, uuid, data } = message.data

        if (uuid === request_uuid) {
            worker.port.removeEventListener("message", handler)
            if (type === "navigation") {
                resolve(data)
            } else {
                const { error } = message.data
                reject(error)
            }
        }
        }
        worker.port.addEventListener("message", handler)

        const message = {
            type: "navigate", uuid: request_uuid,
            wind_provider,
            polar_id: race.boat,
            race,
            boat_options: options,
            request
        }

        console.log(message)

        worker.port.postMessage(message)
    })
}

export async function status(polarId: string, wind_provider: string, options: phtheirichthys.BoatOptions,  position: Point, settings: phtheirichthys.BoatSettings): Promise<phtheirichthys.BoatStatus> {

    let request = {
        from: position,
        boat_settings: settings,
    }

    return new Promise<phtheirichthys.BoatStatus>((resolve, reject) => {
        const request_uuid = uuidv4()
        const handler = (message: MessageEvent<any>) => {
            const { type, uuid, data } = message.data

            if (uuid === request_uuid) {
                worker.port.removeEventListener("message", handler)
                if (type === "status") {
                    resolve(data)
                } else {
                    const { error } = message.data
                    reject(error)
                }
            }
        }
        worker.port.addEventListener("message", handler)

        const message = {
            type: "status", uuid: request_uuid,
            wind_provider,
            polar_id: polarId,
            boat_options: options,
            request
        }

        worker.port.postMessage(message)
    })
}

export async function isLoaded(): Promise<boolean> {

    return new Promise<boolean>((resolve, reject) => {
        const request_uuid = uuidv4()
        const handler = (message: MessageEvent<any>) => {
            const { type, uuid } = message.data

            if (uuid === request_uuid) {
                worker.port.removeEventListener("message", handler)
                if (type === "is-loaded") {
                    resolve(true)
                } else {
                    reject()
                }
            }
        }
        worker.port.addEventListener("message", handler)

        const message = {
            type: "is-loaded", uuid: request_uuid,
        }

        worker.port.postMessage(message)
    })
}
