import { compress, decompress } from "lz-string"

export class Data {
    prefix: string
    boat: boolean
    race: boolean
    compress: boolean
    static RACES = new Data("_races_", false, false)
    static POLARS = new Data("_polars_", false, false)
    static BOATS = new Data("_boats_", false, false)

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

    getItem<T>(ctx: Context = {boat: null, race: null}): T | null {
        function reviver(_key: string, value: any) {
            if(typeof value === 'object' && value !== null) {
                if (value.dataType === 'Map') {
                    return new Map(value.value);
                }
            }
            return value;
        }
          
        let item = localStorage.getItem(this.key(ctx));

        if(this.compress) {
            item = item ? decompress(item) : null
        }

        return item ? JSON.parse(item, reviver) as T : null;    
    }

    setItem<T>(value: T, ctx: Context = {boat: null, race: null}): void {
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

        console.log("value", value)
        let item = JSON.stringify(value, replacer)
        console.log("item", item)

        if(this.compress) {
            item = compress(item)
        }

        localStorage.setItem(this.key(ctx), item);
    }
}

interface Context {
    boat: string | null
    race: string | null
}
