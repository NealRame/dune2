export type TColorRGB  = [number, number, number]
export type TColorRGBA = [number, number, number, number]

export type TPalette = Record<string, TColorRGBA>

export type TSize = {
    width: number
    height: number
}

export type TTextureMapping = Record<string, [TSize, ImageBitmap]>

export type TGameResources = {
    textures: TTextureMapping
}
