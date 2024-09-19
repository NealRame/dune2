import {
    type TPoint,
    type TSize,
} from "@nealrame/maths"

export interface ISceneLayer {
    readonly name: string

    set(pos: TPoint, v: number): this
}

export interface IScene {
    readonly canvas: HTMLCanvasElement
    readonly device: GPUDevice
    readonly context: GPUCanvasContext
    readonly textureFormat: GPUTextureFormat
    readonly isRunning: boolean
    readonly size: TSize

    addLayer(name: string, bitmap: ImageBitmap): ISceneLayer
    getLayerByIndex(index: number): ISceneLayer | null
    getLayerByName(name: string): ISceneLayer | null

    start: () => void
    stop: () => void

    render: () => void
}

export type TSceneTickCallback = (scene: IScene, time: number) => void
