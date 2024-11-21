import {
    type TSize,
} from "@nealrame/maths"

import { 
    type TSceneLayerTexture,
} from "@nealrame/scene"


export type TDune2TextureMapping = Record<string, TSceneLayerTexture>

export type TDune2GameAssets = {
    textures: TDune2TextureMapping
}
