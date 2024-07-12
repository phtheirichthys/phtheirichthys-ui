declare const self: SharedWorkerGlobalScope;

import * as phtheirichthys from '@phtheirichthys/phtheirichthys'
import { Point } from './lib/position';
import { BoatOptions, Heading, Polar, Race, RouteRequest, SnakeParams } from '@phtheirichthys/phtheirichthys';

export type EventData = ({ type: "add-wind-provider" })
    | ({ type: "get-wind-provider-status" } & { provider: string })
    | ({ type: "get-wind" } & { uuid: string, provider: string, moment: Date, point: Point })
    | ({ type: "add-land-provider" })
    | ({ type: "draw-land" } & { canvas: OffscreenCanvas, provider: string, coords: { x: number, y: number, z: number }, size: { width: number, height: number } })
    | ({ type: "eval-snake" } & { uuid: string, route_request: RouteRequest, params: SnakeParams, heading: Heading })
    | ({ type: "navigate" } & { wind_provider: string, polar_id: string, race: Race, boat_options: BoatOptions, request: RouteRequest } )
    | ({ type: "add-polar" } & { name: string, polar: Polar })

console.log("Worker", "Declare", new Date().toISOString())

self.onconnect = (event) => {
    console.log("Worker", "Connect", event.ports)

    const port = event.ports[0];

    port.onmessage = (message) => {
        const data = message.data as EventData;
        switch (data.type) {
            case "add-wind-provider":
                phtheirichthys.add_wind_provider()
                break
            case "get-wind-provider-status":
                try {
                    let status = phtheirichthys.get_wind_provider_status(data.provider)
                    port.postMessage({type: "wind-provider-status", data: status})
                } catch(e) {
                    console.error("Error getting wind provider status", data.provider, e)
                }
                break
            case "get-wind":
                try {
                    let w = phtheirichthys.get_wind(data.provider, data.moment, data.point)
                    port.postMessage({type: "wind", uuid: data.uuid, data: w})
                } catch(e) {
                    console.error("Error getting wind provider status", data.provider, e)
                }
                break
            case "add-land-provider":
                    phtheirichthys.add_land_provider()
                    break
            case "draw-land":
                try {
                    phtheirichthys.draw_land(data.provider, data.canvas, data.coords.x, data.coords.y, data.coords.z, data.size.width, data.size.height)
                } catch(e) {
                    console.error("Drawing land failed", data.provider, e)
                }
                break
            case "eval-snake":
                try {
                    let res = phtheirichthys.eval_snake(data.route_request, data.params, data.heading)
                    port.postMessage({type: "snake", uuid: data.uuid, data: res})
                } catch(e) {
                    console.error("Error evaluating snake", e)
                }
                break
            case "add-polar":
                phtheirichthys.add_polar(data.name, data.polar)
                break
            case "navigate":
                phtheirichthys.navigate(data.wind_provider, data.polar_id, data.race, data.boat_options, data.request).then((res) => {
                    port.postMessage({type: "navigation", data: res})
                }).catch((e) => {
                    console.error("Error evaluating snake", e)
                })
                break
        }
    }
}
