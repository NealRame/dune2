import {
    type TSize,
} from "@nealrame/maths"


export enum TerrainType {
    Dunes = 0,
    Rock,
    Mountain,
    Sand,
    Spice,
}

export type TTerrainDunes = {
    type: TerrainType.Dunes,
}

export type TTerrainRock = {
    type: TerrainType.Rock,
}

export type TTerrainMountain = {
    type: TerrainType.Mountain,
}

export type TTerrainSand = {
    type: TerrainType.Sand,
}

export type TTerrainSpice = {
    type: TerrainType.Spice,
    spice: number
}

export type TTerrain =
    TTerrainDunes
    | TTerrainRock
    | TTerrainMountain
    | TTerrainSand
    | TTerrainSpice

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
