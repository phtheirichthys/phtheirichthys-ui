import type { Heading } from '@phtheirichthys/phtheirichthys/phtheirichthys'

export type SpeedUnit = "Knot" | "MeterPerSecond" | "KiloMeterPerHour"

export type Speed = number

export function dms2dd(dms: {p: number, d: number, m: number, s: number, wrap: number}) {
  var res = dms.p * dms.d + dms.m/60 + dms.s/3600
  res += 360 * dms.wrap
  return res
}

export function dd2dms(D: number): any {
  const res: any = {
    wrap: 0
  }

  while (D > 180) {
    res.wrap += 1
    D -= 360
  }

  while (D < -180) {
    res.wrap -= 1
    D += 360
  }

  res.p = D<0?-1:1
  res.d = 0|(D<0?D=-D:D)
  res.m = 0|D%1*60
  res.s = Math.round((0|D*60%1*6000)/100)

  return res
}

export function lat2string(dms: any) {
  return String(dms.d).padStart(2, "0") + "°" + (dms.p > 0 ? "N" : "S") + " " + String(dms.m).padStart(2, "0") + "'" + String(dms.s).padStart(2, "0") + "\""
}

export function lon2string(dms: any) {
  return String(dms.d).padStart(3, "0") + "°" + (dms.p > 0 ? "E" : "W") + " " + String(dms.m).padStart(2, "0") + "'" + String(dms.s).padStart(2, "0") + "\""
}

export function heading(head: Heading, twd: number): number {
  if ('heading' in head) {
    return head.heading
  } else if ('twa' in head) {
    let heading = twd - head.twa;
    while (heading < 0.0) {
        heading += 360.0
    }
    while (heading >= 360.0) {
        heading -= 360.0
    }
    return heading
  }
  return 0
}

export function twa(head: Heading, twd: number): number {
  if ('twa' in head) {
    return head.twa
  } else if ('heading' in head) {
    let twa = twd - head.heading;
    while (twa <= -180.0) {
        twa += 360.0
    }
    while (twa > 180.0) {
        twa -= 360.0
    }
    return twa
  }
  return 0
}
