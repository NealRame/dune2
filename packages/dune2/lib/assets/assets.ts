import {
    Dune2Resources,
    Dune2Faction,
} from "@nealrame/dune2-rc"

import {
    type TSize,
} from "@nealrame/maths"

import type {
    TDune2GameAssets,
    TDune2TextureMapping,
} from "./types"

import Dune2ResourcesURL from "./dune2_assets.rc"


const TextureTilesPerRow = 16

async function generateTilesetFactionsTexture(
    resources: Dune2Resources,
    tileset: string,
): Promise<[string, TDune2TextureMapping[string]]> {
    const rcTileCount = resources.getTilesetTileCount(tileset)
    const rcTileSize = resources.getTilesetTileSize(tileset)

    const columns = TextureTilesPerRow
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
        const imageData = resources.getTilesetImageData(
            tileset,
            columns,
            faction,
        )

        textureContext.putImageData(imageData, 0, yOffset)
    }

    return [tileset, [tileSize, await createImageBitmap(texture)]]
}

async function generateTilesetTexture(
    resources: Dune2Resources,
    tileset: string,
): Promise<[string, [TSize, ImageBitmap]]> {
    const rcTileSize = resources.getTilesetTileSize(tileset)
    const imageData = resources.getTilesetImageData(tileset, TextureTilesPerRow)

    const image = await createImageBitmap(imageData)
    const tileSize: TSize = {
        width: rcTileSize.width,
        height: rcTileSize.height,
    }

    rcTileSize.free()

    return [tileset, [tileSize, image]]
}

async function generateTextures(
    resources: Dune2Resources,
): Promise<TDune2TextureMapping> {
    return Object.fromEntries(
        await Promise.all(resources.getTilesets().map(
            async tileset => {
                if (tileset == "fog" || tileset == "terrain") {
                    return generateTilesetTexture(resources, tileset)
                } else {
                    return generateTilesetFactionsTexture(resources, tileset)
                }
            }
        ))
    )
}

export async function loadDune2Assets(): Promise<TDune2GameAssets> {
    const res = await fetch(Dune2ResourcesURL)
    const data = await res.arrayBuffer()
    const resources = Dune2Resources.load(new Uint8Array(data))

    const textures = await generateTextures(resources)

    return {
        textures
    }
}
