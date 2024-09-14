import {
    type TSize,
} from "@nealrame/maths"

export type TTextureMapping = Record<string, [TSize, ImageBitmap]>

export type TGameResources = {
    textures: TTextureMapping
}

export enum TerrainType {
    Dunes = 0,
    Sand,
    Rock,
    Mountain,
}

export type TTerrain = {
    type: TerrainType.Sand,
    spice: number
} | {
    type: TerrainType.Dunes
        | TerrainType.Rock
        | TerrainType.Mountain
}

export type TTerrainNeighborhood = [
    TTerrain | null,
    TTerrain | null,
    TTerrain | null,
    TTerrain | null,
]

export type TMapGeneratorOptions = {
    // Map size
    size: TSize

    // Noise seed
    seed?: number,
    
    // Terrain values
    terrainScale?: number,               // clamped to [16, 64]
    terrainDetails?: number,             // clamped to [ 1, 6 ]
    terrainSandThreshold?: number,       // clamped to [ 0, 1 ]
    terrainRockThreshold?: number,       // clamped to [ 0, 1 ]
    terrainMountainsThreshold?: number,  // clamped to [ 0, 1 ]

    // Spice field values
    spiceScale?: number,                 // clamped to [16, 64]
    spiceDetails?: number,               // clamped to [ 1, 6 ]
    spiceThreshold?: number,             // clamped to [ 0, 1 ]
    spiceSaturationThreshold?: number    // clamped to [ spiceThreshold, 1 ]
}
export type TMapGeneratorConfig = Required<TMapGeneratorOptions>
