import {
    Dune2Map,
} from "../map"

import {
    Dune2FogOfWar,
} from "./fog"

import {
    type TDune2FogGeneratorSpawnZoneConfig,
    type TDune2FogGeneratorSpawnZoneOptions,
} from "./schema"


export interface IDune2FogGenerator {
    generate(
        map: Dune2Map,
        options: TDune2FogGeneratorSpawnZoneOptions,
    ): Promise<Dune2Map>
}

function ensureGeneratorConfig(
    map: Dune2Map,
    options: TDune2FogGeneratorSpawnZoneOptions,
): TDune2FogGeneratorSpawnZoneConfig {
    const spawnPoint = options.spawnPoint ?? {
        x: Math.floor(map.size.width/2),
        y: Math.floor(map.size.height/2),
    }
    const radius = options.radius ?? 4

    return {
        spawnPoint,
        radius,
    }
}

export class Dune2FogGenerator {
    async generate(
        map: Dune2Map,
        options: TDune2FogGeneratorSpawnZoneOptions,
    ): Promise<Dune2FogOfWar> {
        const config = ensureGeneratorConfig(map, options)
        const fog = new Dune2FogOfWar(map.size)

        const rowFirst = config.spawnPoint.y - 2
        const rowLast  = config.spawnPoint.y + 2
        const colFirst = config.spawnPoint.x - 2
        const colLast  = config.spawnPoint.x + 2

        for (let y = rowFirst; y <= rowLast; ++y) {
            for (let x = colFirst; x <= colLast; ++x) {
                fog.reveal({ x, y })
            }
        }
        
        return Promise.resolve(fog)
    }
}
