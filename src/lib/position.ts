import L from "leaflet";
import { Speed } from "./utils";
import { Wind } from "./wind";
import { Coords, Heading, Sail } from "@phtheirichthys/phtheirichthys";
import { BoatOptions } from "@phtheirichthys/phtheirichthys";

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
  position!: Point
  settings!: BoatSettings
  options!: BoatOptions
  status!: BoatStatus

  constructor() {
    this.type = "normal"
    this.position = new Point(0, 0)
    this.settings = new BoatSettings()
    this.status = new BoatStatus()
  }
}

export class BoatSettings {
  heading: Heading
  sail: Sail

  constructor() {
    this.heading = {heading: 0}
    this.sail = {index: 0, id: 1, auto: false}
  }
}

export class BoatStatus {
  aground: boolean
  boat_speed: Speed
  wind: Wind
  foil: number
  boost: number
  //vmgs: TODO
  //penalties: TODO
  stamina: number

  constructor() {
    this.aground = false
    this.boat_speed = 0
    this.wind = new Wind(0, 0)
    this.foil = 0
    this.boost = 0
    this.stamina = 0
  }
}
