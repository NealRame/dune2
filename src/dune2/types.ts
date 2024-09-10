import {
    type TSize,
} from "@nealrame/maths"

export type TTextureMapping = Record<string, [TSize, ImageBitmap]>

export type TGameResources = {
    textures: TTextureMapping
}
