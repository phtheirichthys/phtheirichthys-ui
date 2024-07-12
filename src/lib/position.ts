import L from "leaflet";
import { BoatSettings, Coords } from "@phtheirichthys/phtheirichthys";
import { BoatOptions } from "@phtheirichthys/phtheirichthys";
import { BoatStatus } from "@phtheirichthys/phtheirichthys/phtheirichthys";

export class Point implements Coords {
  lat: number;
  lon: number;

  constructor(lat: number, lon: number) {
    this.lat = lat;
    this.lon = lon;
  }

  static fromLatLng(latLng: L.LatLng): Point {
    return new Point(latLng.lat, latLng.lng)
  }
  
  toLatLng(): L.LatLng {
    return new L.LatLng(this.lat, this.lon)
  }
}

export type BoatType = "normal"

export class BoatConfig {
  type: BoatType
  position: Point
  settings: BoatSettings
  options!: BoatOptions
  status: BoatStatus

  constructor() {
    this.type = "normal"
    this.position = new Point(0, 0)
    this.settings = {
      heading: { heading: 0 },
      sail: {index: 0, id: 1, auto: false}
    }
    this.options = {
      lt: false,
      gt: false,
      code0: false,
      foil: false,
      hull: false,
      winch: false,
      stamina: false
    }
    this.status = {
      aground: false,
      boat_speed: 10,
      wind: { direction: 0, speed: 15 },
      foil: 0,
      boost: 0,
      best_ratio: 0,
      ratio: 0,
      vmgs: undefined,
      penalties: { gybe: undefined, sail_change: undefined, tack: undefined },
      stamina: 0,
    }
  }
}
