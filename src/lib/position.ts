import L from "leaflet";
import { Speed } from "./utils";
import { Wind } from "./wind";

export class Point {
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

export type Heading = HeadingHeading | HeadingTwa

export class HeadingHeading {
  heading: number

  constructor(heading: number) {
    this.heading = heading;
  }
}

export class HeadingTwa {
  twa!: number
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
    this.options = new BoatOptions()
    this.status = new BoatStatus()
  }
}

export class BoatSettings {
  heading: Heading
  sail: Sail

  constructor() {
    this.heading = new HeadingHeading(0)
    this.sail = new Sail()
  }
}

export class BoatOptions {
  lt: boolean
  gt: boolean
  code0: boolean
  foil: boolean
  hull: boolean
  winch: boolean
  stamina: boolean
  
  constructor() {
    this.lt = false
    this.gt = false
    this.code0 = false
    this.foil = false
    this.hull = false
    this.winch = false
    this.stamina = false
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

export class Sail {
  index: number
  id: number
  auto: boolean

  constructor() {
    this.index = 0
    this.id = 1
    this.auto = false
  }
}