import {
    type TSize,
} from "@nealrame/maths"

export type TDune2TextureMapping = Record<string, [TSize, ImageBitmap]>

export type TDune2GameResources = {
    textures: TDune2TextureMapping
}

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

export type TDune2MapGeneratorSizeConfig = TSize

export type TDune2MapGeneratorTerrainOptions = {
    terrainScale?: number,
    terrainDetails?: number,
    terrainSandThreshold?: number,       // clamped to [ 0, 1 ]
    terrainRockThreshold?: number,       // clamped to [ 0, 1 ]
    terrainMountainsThreshold?: number,  // clamped to [ 0, 1 ]
}

export type TDune2MapGeneratorSpiceOptions = {
    spiceScale?: number,
    spiceDetails?: number,
    spiceThreshold?: number,             // clamped to [ 0, 1 ]
    spiceSaturationThreshold?: number    // clamped to [ 0, 1 ]
}

export type TDune2MapGeneratorOptions =
    TDune2MapGeneratorSizeConfig
    & TDune2MapGeneratorTerrainOptions
    & TDune2MapGeneratorSpiceOptions
    & { seed?: number }

export type TDune2MapGeneratorConfig = Required<TDune2MapGeneratorOptions>
