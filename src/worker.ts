declare const self: SharedWorkerGlobalScope;

import { Point } from './lib/position';
import { BoatOptions, Heading, Polar, Race, RouteRequest, SnakeParams } from './lib/phtheirichthys';

export type EventData = ({ type: "load" } & { wasmUrl: string })
    | ({ type: "add-wind-provider" })
    | ({ type: "get-wind-provider-status" } & { provider: string })
    | ({ type: "get-wind" } & { uuid: string, provider: string, moment: Date, point: Point })
    | ({ type: "add-land-provider" })
    | ({ type: "draw-land" } & { canvas: OffscreenCanvas, provider: string, coords: { x: number, y: number, z: number }, size: { width: number, height: number } })
    | ({ type: "eval-snake" } & { uuid: string, route_request: RouteRequest, params: SnakeParams, heading: Heading })
    | ({ type: "navigate" } & { uuid: string, wind_provider: string, polar_id: string, race: Race, boat_options: BoatOptions, request: RouteRequest } )
    | ({ type: "add-polar" } & { name: string, polar: Polar })
    | ({ type: "test-webgpu" })

let wasmResolve: (value: any) => void;
let wasmReady = new Promise((resolve) => {
    wasmResolve = resolve;
})

self.onconnect = async (event) => {
    const port = event.ports[0];

    port.onmessage = (message) => {
        const data = message.data as EventData;
        switch (data.type) {
            case "load":
                import(data.wasmUrl).then((phtheirichthys) => {
                    wasmResolve(phtheirichthys)
                })
                break

            case "add-wind-provider":
                wasmReady.then((phtheirichthys: any) => phtheirichthys.add_wind_provider())
                break
            case "get-wind-provider-status":
                wasmReady.then((phtheirichthys: any) => {
                    try {
                        let status = phtheirichthys.get_wind_provider_status(data.provider)
                        port.postMessage({type: "wind-provider-status", data: status})
                    } catch(e) {
                        console.error("Error getting wind provider status", data.provider, e)
                    }
                })
                break
            case "get-wind":
                wasmReady.then((phtheirichthys: any) => {
                    try {
                        let w = phtheirichthys.get_wind(data.provider, data.moment, data.point)
                        port.postMessage({type: "wind", uuid: data.uuid, data: w})
                    } catch(e) {
                        console.error("Error getting wind provider status", data.provider, e)
                    }
                })
                break
            case "add-land-provider":
                wasmReady.then((phtheirichthys: any) => phtheirichthys.add_land_provider())
                break
            case "draw-land":
                wasmReady.then((phtheirichthys: any) => {
                    try {
                        phtheirichthys.draw_land(data.provider, data.canvas, data.coords.x, data.coords.y, data.coords.z, data.size.width, data.size.height)
                    } catch(e) {
                        console.error("Drawing land failed", data.provider, e)
                    }
                })
                break
            case "eval-snake":
                wasmReady.then((phtheirichthys: any) => {
                    try {
                        let res = phtheirichthys.eval_snake(data.route_request, data.params, data.heading)
                        port.postMessage({type: "snake", uuid: data.uuid, data: res})
                    } catch(e) {
                        console.error("Error evaluating snake", e)
                    }
                })
                break
            case "add-polar":
                wasmReady.then((phtheirichthys: any) => phtheirichthys.add_polar(data.name, data.polar))
                break
            case "navigate":
                wasmReady.then((phtheirichthys: any) => {
                    console.log("Worker", "Navigation", data)
                    phtheirichthys.navigate(data.wind_provider, data.polar_id, data.race, data.boat_options, data.request).then((res: any) => {
                        port.postMessage({type: "navigation", uuid: data.uuid, data: res})
                    }).catch((e: any) => {
                        console.error("Error evaluating snake", e)
                    })
                })
                break
            case "test-webgpu":
                wasmReady.then((phtheirichthys: any) => phtheirichthys.test_webgpu())
                break
        }
    }

}
