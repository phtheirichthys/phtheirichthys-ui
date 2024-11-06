import type { Heading, RouteWaypoint } from '@phtheirichthys/phtheirichthys'

export type SpeedUnit = "Knot" | "MeterPerSecond" | "KiloMeterPerHour"

export type Speed = number

export function dms2dd(dms: {p: number, d: number, m: number, s: number, wrap: number}) {
  var res = dms.p * (dms.d + dms.m/60 + dms.s/3600)
  res += 360 * dms.wrap
  return res
}

export function dd2dms(D: number): any {
  const res: any = {
    wrap: 0
  }

  while (D >= 180) {
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

export class Box {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;

  constructor() {
  }

  add(point: {lat: number, lon: number}) {
    this.top = Math.min(this.top || point.lat, point.lat)
    this.bottom = Math.max(this.bottom|| point.lat, point.lat)
    this.left = Math.min(this.left|| point.lon, point.lon)
    this.right = Math.max(this.right|| point.lon, point.lon)
  }
}

export function getTooltipTitle(waypoint_date: Date, wayPosition: RouteWaypoint) {
  const sails = ["Jib", "Spi", "Stay", "LJ", "C0", "HG", "LG"];

  let date = new Date(waypoint_date)
  date.setSeconds(date.getSeconds() + wayPosition.duration)

  const delta = Math.abs(new Date(date).getTime() - new Date().getTime()) / 36e5;

  var j = Math.floor(delta / 24)
  var h = Math.floor(delta % 24)
  var m = Math.round(60 * (delta - j * 24 - h))
  if (m == 60) {
    m = 0
    h ++
  }
  if (h == 24) {
    h = 0
    j ++
  }

  var d = date > new Date()?"+":"-"
  if(j > 0) {
    d += j + "j"
  }
  if(h > 0) {
    if(d.length > 0) d += " "
    d += h + "h"
  }
  if(m > 0) {
    if(d.length > 0) d += " "
    d += m + "m"
  }

  var hrs = date.getHours();
  let min = date.getMinutes().toString();
  if (date.getMinutes() < 10) {
    min = "0" + min;
  }

  const twaValue = twa(wayPosition.boat_settings.heading, wayPosition.status.wind.direction)
  const headingValue = heading(wayPosition.boat_settings.heading, wayPosition.status.wind.direction)

  let sail = sails[wayPosition.boat_settings.sail.index]
  if (wayPosition.boat_settings.sail.auto === true) {
    sail += "*"
  }

  var primary = "<i class='fa fa-compass'></i> " + headingValue.toFixed(1) + "° <i class='fa fa-location-arrow'></i> " + twaValue.toFixed(1) + "° <span class='sail'>" + sail + "</span>"
  if(wayPosition.status.ice) {
    primary += "<span class='ice'><i class='fas fa-igloo'></i></span>"
  } else if(wayPosition.status.foil > 0) {
  //   //primary += "<span class='foil' style='color:rgb(255," + 255 * (wl.foil / 100) + "," + 255 * (wl.foil / 100) + ");'><i class='fa fa-fighter-jet'></i></span>"
    primary += "<span class='foil' style='opacity:" + (wayPosition.status.foil) + "%;'><i class='fa fa-fighter-jet'></i></span>"
  }
  if(wayPosition.status.boost > 0) {
    primary += "<span class='foil' style='opacity:" + (wayPosition.status.boost) + "%;'><i class='fa-solid fa-rocket'></i></span>"
  }
  const secondary = "<i class='fa fa-wind'></i> " + wayPosition.status.wind.direction.toFixed(1) + "° " + wayPosition.status.wind.speed.toFixed(1) + "kt <i class='fa fa-ship'></i> " + wayPosition.status.boat_speed.toFixed(1) + "kt";

  var res = '<div class="date"><span>' + d + '</span><span class="hour">' + hrs + ":" + min + '</span></div><div class="primary">' + primary + '</div>'
  if(secondary)
    res += '<div class="secondary">' + secondary + '</div>';

  var third = ""
  if (wayPosition.status.stamina) {
    third = third + "<span><i class='fa-solid fa-battery-three-quarters'></i> " + wayPosition.status.stamina.toFixed(0) + "% </span>";
  }
  for (var p of wayPosition.status.penalties) {
    let type = ""
    if (p.typ == 1) {
      type = "Gybe"
    } else if (p.typ == 2) {
      type = "Tack"
    } else if (p.typ == 4) {
      type = "Sail"
    }
    third += '<span>' + type + ': ' + p.duration + '</span> '
  }

  if(third.length > 0)
    res += '<div class="secondary">' + third + '</div>';


  return res
}
