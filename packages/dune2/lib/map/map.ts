import {
    type TSize,
    type TPoint,
    clamp,
    createNoise2DGenerator,
    createRangeMapper,
} from "@nealrame/maths"

import {
    type ISceneTilemapLayer,
} from "@nealrame/scene"

import {
    render,
} from "./render"

import {
    type TDune2MapGeneratorConfig,
    type TDune2MapGeneratorOptions,
} from "../schema"

import {
    type TDune2Terrain,
    type TDune2TerrainNeighborhood,
    Dune2TerrainType,
} from "../types"


export const Dune2MapGeneratorConfigDefault: TDune2MapGeneratorConfig = {
    size: {
        width: 16,
        height: 16,
    },

    seed: 0,

    terrain: {
        scale: 32,
        details: 1,
        sandThreshold: 2/5,
        rockThreshold: 5/8,
        mountainsThreshold: 7/8,
    },

    spice: {
        scale: 64,
        details: 6,
        threshold: 6/10,
        saturationThreshold: 8/10,
    },
}

function ensureGeneratorConfig(
    options: TDune2MapGeneratorOptions,
): TDune2MapGeneratorConfig {
    const config: TDune2MapGeneratorConfig  = {
        size: { ...options.size },
        seed: Date.now(),
        terrain: { ...Dune2MapGeneratorConfigDefault.terrain },
        spice: { ...Dune2MapGeneratorConfigDefault.spice },
    }

    config.seed = options.seed ?? config.seed

    if (options.terrain != null) {
        config.terrain = {
            ...config.terrain,
            ...options.terrain,
        }
    }
    config.terrain.sandThreshold = clamp(0, 1, config.terrain.sandThreshold)
    config.terrain.rockThreshold = clamp(0, 1, config.terrain.rockThreshold)
    config.terrain.mountainsThreshold = clamp(0, 1, config.terrain.mountainsThreshold)

    if (options.spice != null) {
        config.spice = {
            ...config.spice,
            ...options.spice,
        }
    }
    config.spice.threshold = clamp(0, 1, config.spice.threshold)
    config.spice.saturationThreshold = clamp(0, 1, config.spice.saturationThreshold)

    return config
}

function spiceFieldGenerator(
    config: TDune2MapGeneratorConfig
): (pos: TPoint) => number {
    const map = createRangeMapper(-1, 1, 0, 1)
    const noise = createNoise2DGenerator({
        seed: config.seed + 1,
        scale: config.spice.scale,
        octaves: config.spice.details,
    })

    return pos => {
            const s = map(noise(pos.x, pos.y))

            if (s >= config.spice.saturationThreshold) {
                return 1.0
            }
            if (s >= config.spice.threshold) {
                return 0.5
            }
            return 0
    }
}

function terrainTypeGenerator(
    config: TDune2MapGeneratorConfig
): (pos: TPoint, spice: number) => Dune2TerrainType {
    const map = createRangeMapper(-1, 1, 0, 1)
    const noise = createNoise2DGenerator({
        seed: config.seed,
        scale: config.terrain.scale,
        octaves: config.terrain.details,
    })

    return (pos, spice) => {
        const v = map(noise(pos.x, pos.y))

        if (v >= config.terrain.mountainsThreshold) {
            return Dune2TerrainType.Mountain
        }

        if (v >= config.terrain.rockThreshold) {
            return Dune2TerrainType.Rock
        }

        if (spice > 0) {
            return Dune2TerrainType.Spice
        }

        if (v >= config.terrain.sandThreshold) {
            return Dune2TerrainType.Sand
        }

        return Dune2TerrainType.Dunes
    }
}

export class Dune2Map {
    public static generate(
        options: TDune2MapGeneratorOptions,
    ): Dune2Map {
        const generatorConfig = ensureGeneratorConfig(options)

        const spiceField = spiceFieldGenerator(generatorConfig)
        const terrainType = terrainTypeGenerator(generatorConfig)
        const terrains: Array<TDune2Terrain> = []

        for (let y = 0; y < generatorConfig.size.height; ++y) {
        for (let x = 0; x < generatorConfig.size.width; ++x) {
            const pos = { x, y }
            const spice = spiceField(pos)
            const type = terrainType(pos, spice)

            if (type === Dune2TerrainType.Spice) {
                terrains.push({
                    type,
                    spice,
                })
            } else {
                terrains.push({
                    type,
                })
            }
        }}

        return new Dune2Map({ ...generatorConfig.size }, terrains)
    }

    public render: (layer: ISceneTilemapLayer) => Dune2Map

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
