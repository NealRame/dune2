import {
    type TSize,
    type TPoint,
    clamp,
    createNoise2DGenerator,
    createRangeMapper,
} from "@nealrame/maths"

import {
    type TMapGeneratorOptions,
    type TMapGeneratorConfig,
    type TTerrain,
    type TTerrainNeighborhood,
    TerrainType,
} from "./types"


export const MapGeneratorConfigDefault: TMapGeneratorConfig = {
    size: {
        width: 64,
        height: 64,
    },

    seed: 0,

    terrainScale: 32,
    terrainDetails: 1,
    terrainSandThreshold: 2/5,
    terrainRockThreshold: 5/8,
    terrainMountainsThreshold: 7/8,

    spiceScale: 64,
    spiceDetails: 6,
    spiceThreshold: 6/10,
    spiceSaturationThreshold: 8/10,
}

function ensureGeneratorConfig(
    options: TMapGeneratorOptions,
): TMapGeneratorConfig {
    const config = {
        ...MapGeneratorConfigDefault,
        seed: Date.now(),
        ...options,
    }

    config.terrainSandThreshold = clamp(0, 1, config.terrainSandThreshold)
    config.terrainRockThreshold = clamp(0, 1, config.terrainRockThreshold)
    config.terrainMountainsThreshold = clamp(0, 1, config.terrainMountainsThreshold)

    config.spiceThreshold = clamp(0, 1, config.spiceThreshold)
    config.spiceSaturationThreshold = clamp(0, 1, config.spiceSaturationThreshold)

    return config
}

function terrainTypeGenerator(
    config: TMapGeneratorConfig
): (pos: TPoint) => TerrainType {
    const map = createRangeMapper(-1, 1, 0, 1)
    const noise = createNoise2DGenerator({
        seed: config.seed,
        scale: config.terrainScale,
        octaves: config.terrainDetails,
    })

    return pos => {
        const v = map(noise(pos.x, pos.y))

        if (v >= config.terrainMountainsThreshold) {
            return TerrainType.Mountain
        }

        if (v >= config.terrainMountainsThreshold) {
            return TerrainType.Rock
        }

        if (v >= config.terrainRockThreshold) {
            return TerrainType.Sand
        }

        return TerrainType.Dunes
    }
}


function spiceFieldGenerator(
    config: TMapGeneratorConfig
): (pos: TPoint) => number {
    const map = createRangeMapper(-1, 1, 0, 1)
    const noise = createNoise2DGenerator({
        seed: config.seed + 1,
        scale: config.spiceScale,
        octaves: config.spiceDetails,
    })

    return pos => {
            const s = map(noise(pos.x, pos.y))

            if (s >= config.spiceSaturationThreshold) {
                return 1.0
            }

            if (s >= config.spiceThreshold) {
                return 0.5
            }

            return 0
    }
}

export class Dune2Map {
    private constructor(
        private size_: TSize,
        private terrains_: Array<TTerrain>,
    ) {}

    public static generate(
        options: TMapGeneratorOptions,
    ): Dune2Map {
        const generatorConfig = ensureGeneratorConfig(options)
        const terrain = terrainTypeGenerator(generatorConfig)
        const spice = spiceFieldGenerator(generatorConfig)
        const size = generatorConfig.size
        const terrains = []

        for (let y = 0; y < size.height; ++y) {
            for (let x = 0; x < size.width; ++x) {
                const pos = { x, y }
                const type = terrain(pos)

                if (type == TerrainType.Sand) {
                    terrains.push({
                        type,
                        spice: spice(pos)
                    })
                } else {
                    terrains.push({ type })
                }
            }
        }

        return new Dune2Map(size, terrains)
    }

    public terrainAt({x, y}: TPoint): TTerrain | null {
        if (x < 0 || x >= this.size_.width) {
            return null
        }

        if (y < 0 || y >= this.size_.height) {
            return null
        }

        return this.terrains_[x + y*this.size_.width]
    }

    public neighborhoodAt({x, y}: TPoint): TTerrainNeighborhood {
        return [
            this.terrainAt({x, y: y - 1 }), // North
            this.terrainAt({x: x + 1, y }), // East
            this.terrainAt({x, y: y + 1 }), // South
            this.terrainAt({x: x - 1, y }), // West
        ]
    }

    public get size(): TSize {
        return {...this.size_}
    }

}
