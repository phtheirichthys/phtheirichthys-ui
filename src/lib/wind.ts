import { Speed } from './utils';

export module WindService {
    let provider = "vr"

    export function get_provider(): string {
        return provider
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
