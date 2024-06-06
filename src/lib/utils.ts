export type SpeedUnit = "Knot" | "MeterPerSecond" | "KiloMeterPerHour"

export type Speed = number

export module Utils {
    export function dms2dd(p: number, d: number, m: number, s: number, wrap: boolean) {
        var res = Number(p) * (Number(d) + Number(m)/60 + Number(s)/3600)
        if (wrap === true) {
          res += 360
        }
        return res
      }
    
      export function dd2dms(D: number): any {
        const res: any = {}
        if (D > 180) {
          res.wrap = true
          D -= 360
        } else {
          res.wrap = false
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
}