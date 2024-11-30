import {
    type TSize,
    type TPoint,
} from "@nealrame/maths"

import {
    type ISceneTilemapLayer,
} from "@nealrame/scene"

import {
    posToIndex,
} from "../utils"


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

function isDunes(t: TDune2Terrain | null): boolean {
    return t?.type === Dune2TerrainType.Dunes
}

function isMountain(t: TDune2Terrain | null): boolean {
    return t?.type === Dune2TerrainType.Mountain
}

function isRock(t: TDune2Terrain | null): boolean {
    return t?.type === Dune2TerrainType.Rock
        || t?.type === Dune2TerrainType.Mountain
}

function isSpiceLo(t: TDune2Terrain | null): boolean {
    return t?.type === Dune2TerrainType.Spice
        && t.spice <= 0.5
}

function isSpiceHi(t: TDune2Terrain | null): boolean {
    return t?.type === Dune2TerrainType.Spice
        && t.spice > 0.5
}

function isSpice(t: TDune2Terrain | null): boolean {
    return isSpiceLo(t)
        || isSpiceHi(t)
}

function neighborhoodMask(
    neighborhood: TDune2TerrainNeighborhood,
    pred: (t: TDune2Terrain | null) => boolean,
): number {
    const north = pred(neighborhood[0]) ? 1 : 0
    const east  = pred(neighborhood[1]) ? 1 : 0
    const south = pred(neighborhood[2]) ? 1 : 0
    const west  = pred(neighborhood[3]) ? 1 : 0

    return north | (east << 1) | (south << 2) | (west << 3)
}

function renderRock(
    neighborhood: TDune2TerrainNeighborhood,
): number {
    return 1 + neighborhoodMask(neighborhood, isRock)
}

function renderDunes(
    neighborhood: TDune2TerrainNeighborhood,
): number {
    return 17 + neighborhoodMask(neighborhood, isDunes)
}

function renderMountain(
    neighborhood: TDune2TerrainNeighborhood,
): number {
    return 33 + neighborhoodMask(neighborhood, isMountain)
}

function renderSpice(
    spice: number,
    neighborhood: TDune2TerrainNeighborhood,
): number {
    if (spice > 0.5) {
        return 65 + neighborhoodMask(neighborhood, isSpiceHi)
    } else {
        return 49 + neighborhoodMask(neighborhood, isSpice)
    }
}


export class Dune2Map {
    private modified_: boolean = true
    
    public constructor(
        private size_: TSize,
        private terrains_: Array<TDune2Terrain>,
    ) { }

    public terrainAt(
        position: TPoint,
        fallback: TDune2Terrain | null = null,
    ): TDune2Terrain | null {
        const index = posToIndex(position, this.size_)

        return index != null
            ? this.terrains_[index]
            : fallback
    }

    public setTerrainAt(
        position: TPoint,
        newTerrain: TDune2Terrain,
    ): Dune2Map {
        const index = posToIndex(position, this.size_)
        
        if (index != null) {
            const oldTerrain = this.terrains_[index]
            
            if (oldTerrain.type != newTerrain.type) {
                this.terrains_[index] = newTerrain
                this.modified_ = true
            }
            
            if (oldTerrain.type == Dune2TerrainType.Spice
                && newTerrain.type == Dune2TerrainType.Spice
                && oldTerrain.spice != newTerrain.spice
            ) {
                this.terrains_[index] = newTerrain
                this.modified_ = true
            }
        }

        return this
    }
    
    public neighborhoodAt(
        { x, y }: TPoint,
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
    
    public render(
        layer: ISceneTilemapLayer,
    ): Dune2Map {
        for (let y = 0; y < this.height; ++y) {
        for (let x = 0; x < this.width; ++x) {
            const position = { x, y }
            const terrain = this.terrainAt(position)
            const neighborhood = this.neighborhoodAt(position, terrain)
    
            let textureIndex = -1
    
            if (terrain != null) {
                switch (terrain.type) {
                case Dune2TerrainType.Sand:
                    textureIndex = 0
                    break
    
                case Dune2TerrainType.Spice:
                    textureIndex = renderSpice(terrain.spice, neighborhood)
                    break
    
                case Dune2TerrainType.Dunes:
                    textureIndex = renderDunes(neighborhood)
                    break
    
                case Dune2TerrainType.Mountain:
                    textureIndex = renderMountain(neighborhood)
                    break
        
                case Dune2TerrainType.Rock:
                    textureIndex = renderRock(neighborhood)
                    break
    
                default:
                    break
                }
    
                layer.set({ position, textureIndex })
            }
        }}
        this.modified_ = false
        return this
    }
}
