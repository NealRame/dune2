import {
    type TSize,
    type TPoint,
    clamp,
    createNoise2DGenerator,
    createRangeMapper,
} from "@nealrame/maths"

import {
    ISceneLayerHandler,
    type IScene,
} from "@nealrame/scene"

import {
    render,
} from "./render"

import {
    type TDune2MapGeneratorOptions,
    type TDune2MapGeneratorConfig,
    type TDune2Terrain,
    type TDune2TerrainNeighborhood,
    Dune2TerrainType,
} from "./types"


export const Dune2MapGeneratorConfigDefault: TDune2MapGeneratorConfig = {
    size: {
        width: 16,
        height: 16,
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
    options: TDune2MapGeneratorOptions,
): TDune2MapGeneratorConfig {
    const config = {
        ...Dune2MapGeneratorConfigDefault,
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
    config: TDune2MapGeneratorConfig
): (pos: TPoint) => Dune2TerrainType {
    const map = createRangeMapper(-1, 1, 0, 1)
    const noise = createNoise2DGenerator({
        seed: config.seed,
        scale: config.terrainScale,
        octaves: config.terrainDetails,
    })

    return pos => {
        const v = map(noise(pos.x, pos.y))

        if (v >= config.terrainMountainsThreshold) {
            return Dune2TerrainType.Mountain
        }

        if (v >= config.terrainRockThreshold) {
            return Dune2TerrainType.Rock
        }

        if (v >= config.terrainSandThreshold) {
            return Dune2TerrainType.Sand
        }

        return Dune2TerrainType.Dunes
    }
}


function spiceFieldGenerator(
    config: TDune2MapGeneratorConfig
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
    public static generate(
        options: TDune2MapGeneratorOptions,
    ): Dune2Map {
        const generatorConfig = ensureGeneratorConfig(options)
        const terrain = terrainTypeGenerator(generatorConfig)
        const spiceField = spiceFieldGenerator(generatorConfig)
        const size = generatorConfig.size
        const terrains = []

        for (let y = 0; y < size.height; ++y) {
        for (let x = 0; x < size.width; ++x) {
            const pos = { x, y }
            const spice = spiceField(pos)
            const type = terrain(pos)

            if ((type == Dune2TerrainType.Dunes || type == Dune2TerrainType.Sand)
                && spice > 0
            ) {
                terrains.push({
                    type: Dune2TerrainType.Spice,
                    spice,
                })
            } else {
                terrains.push({
                    type,
                })
            }
        }}

        return new Dune2Map(size, terrains)
    }

    public render: (layer: ISceneLayerHandler) => Dune2Map

    public constructor(
        private size_: TSize,
        private terrains_: Array<TDune2Terrain>,
    ) {
        this.render = render
    }

    public terrainAt(
        {x, y}: TPoint,
        fallback: TDune2Terrain | null = null,
    ): TDune2Terrain | null {
        if (x < 0 || x >= this.size_.width) {
            return fallback
        }

        if (y < 0 || y >= this.size_.height) {
            return fallback
        }

        return this.terrains_[y*this.size_.width + x]
    }

    public neighborhoodAt(
        {x, y}: TPoint,
        fallback: TDune2Terrain | null = null,
    ): TDune2TerrainNeighborhood {
        return [
            this.terrainAt({ x, y: y - 1 }, fallback), // North
            this.terrainAt({ x: x + 1, y }, fallback), // East
            this.terrainAt({ x, y: y + 1 }, fallback), // South
            this.terrainAt({ x: x - 1, y }, fallback), // West
        ]
    }

    public get size(): TSize {
        return {...this.size_ }
    }

    public get height() { return this.size_.height }
    public get width()  { return this.size_.width }
}
