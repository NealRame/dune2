import {
    Dune2Resources,
    Dune2Faction,
} from "@nealrame/dune2-rc"

import Dune2ResourcesURL from "./dune2.rc"

import type {
    TGameResources,
    TSize,
    TTextureMapping,
} from "./types"


const TextureTilesPerRow = 16


async function generateTilesetFactionsTexture(
    resources: Dune2Resources,
    tilesetId: string,
): Promise<[string, TTextureMapping[string]]> {
    const rcTileCount = resources.getTilesetTileCount(tilesetId)
    const rcTileSize = resources.getTilesetTileSize(tilesetId)

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
            tilesetId,
            columns,
            faction,
        )

        textureContext.putImageData(imageData, 0, yOffset)
    }

    return [tilesetId, [tileSize, await createImageBitmap(texture)]]
}

async function generateTilesetTexture(
    resources: Dune2Resources,
    tilesetId: string,
): Promise<[string, [TSize, ImageBitmap]]> {
    const rcTileSize = resources.getTilesetTileSize(tilesetId)

    const tileSize: TSize = {
        width: rcTileSize.width,
        height: rcTileSize.height,
    }

    const imageData = resources.getTilesetImageData(tilesetId, TextureTilesPerRow)
    const image = await createImageBitmap(imageData)

    rcTileSize.free()

    return [tilesetId, [tileSize, image]]
}

async function generateTextures(
    resources: Dune2Resources,
): Promise<TTextureMapping> {
    return Object.fromEntries(
        await Promise.all(resources.getTilesets().map(
            async tilesetId => {
                if (tilesetId == "terrain") {
                    return generateTilesetTexture(resources, tilesetId)
                } else {
                    return generateTilesetFactionsTexture(resources, tilesetId)
                }
            }
        ))
    )
}

export async function loadGameResources(): Promise<TGameResources> {
    const res = await fetch(Dune2ResourcesURL)
    const data = await res.arrayBuffer()
    const resources = Dune2Resources.load(new Uint8Array(data))

    const textures = await generateTextures(resources)

    return {
        textures
    }
}
