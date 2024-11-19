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
