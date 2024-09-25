import {
    type ISceneLayerHandler,
} from "@nealrame/scene"

import {
    Dune2Map,
} from "./map"

import {
    type TTerrain,
    type TTerrainNeighborhood,
    TerrainType,
} from "./types"


function isDunes(t: TTerrain | null): boolean {
    return t?.type === TerrainType.Dunes
}

function isMountain(t: TTerrain | null): boolean {
    return t?.type === TerrainType.Mountain
}

function isRock(t: TTerrain | null): boolean {
    return t?.type === TerrainType.Rock
        || t?.type === TerrainType.Mountain
}

function isSpiceLo(t: TTerrain | null): boolean {
    return t?.type === TerrainType.Spice
        && t.spice <= 0.5
}

function isSpiceHi(t: TTerrain | null): boolean {
    return t?.type === TerrainType.Spice
        && t.spice > 0.5
}

function neighborhoodMask(
    neighborhood: TTerrainNeighborhood,
    pred: (t: TTerrain | null) => boolean,
): number {
    const north = pred(neighborhood[0]) ? 1 : 0
    const east  = pred(neighborhood[1]) ? 1 : 0
    const south = pred(neighborhood[2]) ? 1 : 0
    const west  = pred(neighborhood[3]) ? 1 : 0

    return north | (east << 1) | (south << 2) | (west << 3)
}

function renderRock(
    neighborhood: TTerrainNeighborhood,
): number {
    return 1 + neighborhoodMask(neighborhood, isRock)
}

function renderDunes(
    neighborhood: TTerrainNeighborhood,
): number {
    return 17 + neighborhoodMask(neighborhood, isDunes)
}

function renderMountain(
    neighborhood: TTerrainNeighborhood,
): number {
    return 33 + neighborhoodMask(neighborhood, isMountain)
}

function renderSpice(
    spice: number,
    neighborhood: TTerrainNeighborhood,
): number {
    if (spice > 0.5) {
        return 65 + neighborhoodMask(neighborhood, isSpiceHi)
    } else {
        return 49 + neighborhoodMask(neighborhood, isSpiceLo)
    }
}

export const renderer = (map: Dune2Map) => (layer: ISceneLayerHandler) => {
    for (let y = 0; y < map.height; ++y) {
    for (let x = 0; x < map.width; ++x) {
        const pos = {x, y}
        const terrain = map.terrainAt(pos)
        const neighborhood = map.neighborhoodAt(pos)

        switch (terrain.type) {
        case TerrainType.Sand:
            layer.set(pos, 0)
            break

        case TerrainType.Spice:
            layer.set(pos, renderSpice(terrain.spice, neighborhood))
            break

        case TerrainType.Dunes:
            layer.set(pos, renderDunes(neighborhood))
            break

        case TerrainType.Mountain:
            layer.set(pos, renderMountain(neighborhood))
            break

        case TerrainType.Rock:
            layer.set(pos, renderRock(neighborhood))
            break
        }
    }}
    return map
}
