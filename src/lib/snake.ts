import * as phtheirichthys from 'phtheirichthys'
import { Wind, WindService } from './wind'
import { Heading } from './position'

export module SnakeService {
    export function eval_snake(heading: Heading) {

        let boat_settings = {
            heading: {twa: 90},
            sail: {
                index: 0,
                id: 1,
                auto: false,
            }
        }

        let status = {
            aground: false,
            boat_speed: 0,
            wind: new Wind(0, 0),
            foil: 0,
            boost: 0,
            best_ratio: 0,
            ratio: 0,
            penalties: {},
            stamina: 1,
        }

        return phtheirichthys.eval_snake(
            {"from":{"lat":0,"lon":0}, "start_time": new Date().toISOString(), "boat_settings": boat_settings, "status": status, "steps": []},
            {
                max_duration: 48,
                polar: "maxi_trimaran_x10percent",
                wind_provider: WindService.get_provider(),
                boat_options: {
                    lt: false,
                    gt: false,
                    code0: false,
                    foil: false,
                    hull: false,
                    winch: false,
                    stamina: false,
                }
            },
            heading
        )
    }
}
