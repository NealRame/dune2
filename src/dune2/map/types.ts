import {
    type TSize,
} from "@nealrame/maths"


export enum Dune2TerrainType {
    Dunes = 0,
    Rock,
    Mountain,
    Sand,
    Spice,
}

export type TDune2TerrainDunes = {
    type: Dune2TerrainType.Dunes,
}

export type TDune2TerrainRock = {
    type: Dune2TerrainType.Rock,
}

export type TDune2TerrainMountain = {
    type: Dune2TerrainType.Mountain,
}

export type TDune2TerrainSand = {
    type: Dune2TerrainType.Sand,
}

export type TDune2TerrainSpice = {
    type: Dune2TerrainType.Spice,
    spice: number
}

export type TDune2Terrain =
    TDune2TerrainDunes
    | TDune2TerrainRock
    | TDune2TerrainMountain
    | TDune2TerrainSand
    | TDune2TerrainSpice

export type TDune2TerrainNeighborhood = [
    TDune2Terrain | null,
    TDune2Terrain | null,
    TDune2Terrain | null,
    TDune2Terrain | null,
]

export type TDune2MapGeneratorOptions = {
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
export type TDune2MapGeneratorConfig = Required<TDune2MapGeneratorOptions>
