import {
    type TPoint,
    type TSize,
    Rect,
} from "@nealrame/maths"

export interface ISceneLayerHandler {
    set(pos: TPoint, v: number): this
}

export interface IScene {
    readonly canvas: HTMLCanvasElement
    readonly device: GPUDevice
    readonly context: GPUCanvasContext
    readonly textureFormat: GPUTextureFormat
    readonly isRunning: boolean

    readonly gridSize: TSize
    readonly size: TSize

    viewport: Rect

    addLayer(name: string, textureImage: ImageBitmap, textureTileSize: TSize): IScene
    getLayerByIndex(index: number): ISceneLayerHandler | null
    getLayerByName(name: string): ISceneLayerHandler | null

    start: () => void
    stop: () => void

    render: () => void
}

export type TSceneTickCallback = (scene: IScene, time: number) => void
