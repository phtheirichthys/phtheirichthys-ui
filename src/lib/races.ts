export module RaceService {

    // ***************
    // ** RACES
    // ***************

    interface Race {
        race_id: string,
        name: string,
        shortName?: string,
        boat: string,
        stamina: boolean,

    }

    let races: Map<String, Race>

}