import { compress, decompress } from "lz-string"

export class Data {
    prefix: string
    boat: boolean
    race: boolean
    compress: boolean
    static VERSION = new Data("_version_", false, false)
    static RACES = new Data("_races_", false, false)
    static POLARS = new Data("_polars_", false, false, true)
    static BOATS = new Data("_boats_", false, false)
    static OPTIONS = new Data("_options_", true, true)
    static POSITION = new Data("_position_", true, true)
    static SETTINGS = new Data("_settings_", true, true)
    static PAN_ZOOM = new Data("_pan_zoom_", true, true)
    static ROUTE = new Data("_route_", true, true, true)
    static PREVIOUS_ROUTES = new Data("_previous_routes_", true, true, true)

    constructor(prefix: string, boat: boolean, race: boolean, compress: boolean = false) {
        this.prefix = prefix
        this.boat = boat
        this.race = race
        this.compress = compress
    }

    key(ctx: Context): string {
        let key = this.prefix
        if(this.boat && ctx.boat && ctx.boat != '-') {
            key += "_"  + ctx.boat
        } 
        if(this.race && ctx.race && ctx.race != '-') {
            key += "_"  + ctx.race
        }
        return key
    }

    getItem<T>(ctx: Context = {boat: null, race: null}, post?: (val: any) => void): T | null {
          
        let item = localStorage.getItem(this.key(ctx));

        if(this.compress) {
            item = item ? decompress(item) : null
        }

        let res = item ? this.parse<T>(item) : null;    
        if (post) {
            post(res)
        }
        
        return res
    }

    parse<T>(item: any): T | null {
        function reviver(_key: string, value: any) {
            if(typeof value === 'object' && value !== null) {
                if (value.dataType === 'Map') {
                    return new Map(value.value);
                }
            }
            return value;
        }

        try {
            return JSON.parse(item, reviver) as T
        } catch(e) {
            console.error("Error parsing data", e)
        }
        return null
    }

    setItem<T>(value: T, ctx: Context = {boat: null, race: null}): void {
        // console.log("setItem", this, ctx)
        function replacer(_key: string, value: any) {
            if(value instanceof Map) {
                return {
                dataType: 'Map',
                value: Array.from(value.entries()), // or with spread: value: [...value]
                };
            } else {
                return value;
            }
        }

        let item = JSON.stringify(value, replacer)

        if(this.compress) {
            item = compress(item)
        }

        localStorage.setItem(this.key(ctx), item);
    }
}

export interface Context {
    boat: string | null
    race: string | null
}

const version = 1

function migrate() {
    let previousVersion = Data.VERSION.getItem()
    if (!previousVersion) {
        console.log("Migrate data from version 0")
        // compress polars
        let to_migrate = new Data("_polars_", false, false, false).getItem()
        Data.POLARS.setItem(to_migrate)
    }
    Data.VERSION.setItem(version)
}

migrate()