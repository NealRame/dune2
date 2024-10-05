import {
    type ISceneLayerHandler,
} from "@nealrame/scene"

import {
    Dune2Map,
} from "./map"

import {
    type TDune2Terrain,
    type TDune2TerrainNeighborhood,
    Dune2TerrainType,
} from "../types"


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

export function render(
    this: Dune2Map,
    layer: ISceneLayerHandler,
): Dune2Map {
    for (let y = 0; y < this.height; ++y) {
    for (let x = 0; x < this.width; ++x) {
        const pos = {x, y}
        const terrain = this.terrainAt(pos)
        const neighborhood = this.neighborhoodAt(pos, terrain)

        switch (terrain.type) {
        case Dune2TerrainType.Sand:
            layer.set(pos, 0)
            break

        case Dune2TerrainType.Spice:
            layer.set(pos, renderSpice(terrain.spice, neighborhood))
            break

        case Dune2TerrainType.Dunes:
            layer.set(pos, renderDunes(neighborhood))
            break

        case Dune2TerrainType.Mountain:
            layer.set(pos, renderMountain(neighborhood))
            break

        case Dune2TerrainType.Rock:
            layer.set(pos, renderRock(neighborhood))
            break

        default:
            break
        }
    }}

    return this
}
