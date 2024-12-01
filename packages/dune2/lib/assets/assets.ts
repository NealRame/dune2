import {
    Dune2AssetsData,
    Dune2Faction,
} from "@nealrame/dune2-assets"

import type {
    TSize,
} from "@nealrame/maths"

import type {
    TSceneLayerTexture,
} from "@nealrame/scene"

import type {
    TDune2GameAssets,
    TDune2TextureMapping,
} from "./types"

import Dune2ResourcesURL from "./dune2_assets.bin"


const TEXTURE_TILES_PER_ROW = 16

async function generateTilesetFactionsTexture(
    assetsData: Dune2AssetsData,
    tileset: string,
): Promise<[string, TSceneLayerTexture]> {
    const rcTileCount = assetsData.getTilesetTileCount(tileset)
    const rcTileSize = assetsData.getTilesetTileSize(tileset)

    const columns = TEXTURE_TILES_PER_ROW
    const rows = Math.ceil(rcTileCount/columns)
    const tileSize: TSize = {
        width: rcTileSize.width,
        height: rcTileSize.height,
    }

    const texture = new OffscreenCanvas(
        columns*tileSize.width,                 // texture width
        Dune2Faction.Count*rows*tileSize.height // texture height
    )
    const textureContext = texture.getContext("2d")!

    rcTileSize.free()

    for (let faction = 0; faction < Dune2Faction.Count; ++faction) {
        const yOffset = faction*rows*tileSize.height
        const imageData = assetsData.getTilesetImageData(
            tileset,
            columns,
            faction,
        )

        textureContext.putImageData(imageData, 0, yOffset)
    }

    const surface = await createImageBitmap(texture)

    return [tileset, {
        surface,
        tileSize,
        tilesPerRow: TEXTURE_TILES_PER_ROW,
    }]
}

async function generateTilesetTexture(
    assetsData: Dune2AssetsData,
    tileset: string,
): Promise<[string, TSceneLayerTexture]> {
    const rcTileSize = assetsData.getTilesetTileSize(tileset)
    const imageData = assetsData.getTilesetImageData(tileset, TEXTURE_TILES_PER_ROW)

    const surface = await createImageBitmap(imageData)
    const tileSize: TSize = {
        width: rcTileSize.width,
        height: rcTileSize.height,
    }

    rcTileSize.free()

    return [tileset, {
        surface,
        tileSize,
        tilesPerRow: TEXTURE_TILES_PER_ROW,
    }]
}

async function generateTextures(
    assetsData: Dune2AssetsData,
): Promise<TDune2TextureMapping> {
    return Object.fromEntries(
        await Promise.all(assetsData.getTilesets().map(
            async tileset => {
                if (tileset == "fog" || tileset == "terrain") {
                    return generateTilesetTexture(assetsData, tileset)
                } else {
                    return generateTilesetFactionsTexture(assetsData, tileset)
                }
            }
        ))
    )
}

export async function loadDune2Assets(): Promise<TDune2GameAssets> {
    const res = await fetch(Dune2ResourcesURL)
    const data = await res.arrayBuffer()
    const assetsData = Dune2AssetsData.load(new Uint8Array(data))

    const textures = await generateTextures(assetsData)

    return {
        textures
    }
}
