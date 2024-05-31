import * as phtheirichthys from '@phtheirichthys/phtheirichthys'
import { Point } from './position';
import { Speed } from './utils';

export module WindService {
    let provider = "vr"

    export function get_provider(): String {
        return provider
    }

    export function status() {
        return phtheirichthys.get_wind_provider_status(provider);
    }

    export function get_wind(point: Point): Wind {
        let w = phtheirichthys.get_wind(provider,new Date(), point)
        return new Wind(w.direction, w.speed)
    }

}

export class Wind {
    direction: number
    speed: Speed

    constructor(direction: number, speed: Speed) {
        this.direction = direction;
        this.speed = speed;
    }
}
