export module DataService {
    const SETTINGS = "_settings_"
    const BOATS = "_boats_"
    const RACES = "_races_"

    const EMPTY = ""

    const PAN = "_pan_"
    const ZOOM = "_zoom_"

    interface Model {
        model: string,
        context: {
            boat: boolean,
            race: boolean
        }
    }

    const models: Array<Model> = [
        { model: SETTINGS, context: { boat: false, race: false } },
        { model: BOATS, context: { boat: false, race: false } },
        { model: RACES, context: { boat: false, race: false } },
        { model: PAN, context: { boat: true, race: true } },
        { model: ZOOM, context: { boat: true, race: true } },
        { model: EMPTY, context: { boat: true, race: true } },
    ]

    function suffix(boat: String | null, race: String) {
        return ((boat && boat != "-") ? boat + "_" : "") + race
    }


    interface Info {
        model?: string,
        boat?: string,
        race?: string,
        context?: {
            boat: boolean,
            race: boolean
        }
    }

    function getInfoFromKey(key: String) {
        let res: Info = {
        }
        for (var m in models) {
            if (key.startsWith(models[m].model)) {
                res.model = models[m].model
                res.context = models[m].context
                var infos = key.substring(res.model.length).split("_")

                if (infos.length > 0) {
                    res.race = infos[infos.length - 1]

                    for (var i = 0; i < infos.length - 1; i++) {
                        if (i > 0)
                            res.boat += "_"
                        else
                            res.boat = ""
                        res.boat += infos[i]
                    }
                }
                return res
            }
        }

        return res
    }

    function clean() {
        //todo
    }

    // ***************
    // ** SETTINGS
    // ***************

    function getSettings() {
        return JSON.parse(localStorage.getItem(SETTINGS)!)
    }
    
    function saveSettings(settings: any) {
        localStorage.setItem(SETTINGS, JSON.stringify(settings))
    }
}