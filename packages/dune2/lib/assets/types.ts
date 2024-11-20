import {
    type TSize,
} from "@nealrame/maths"

export type TDune2TextureMapping = Record<string, [TSize, ImageBitmap]>

export type TDune2GameAssets = {
    textures: TDune2TextureMapping
}
