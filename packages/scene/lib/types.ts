import {
    type TPoint,
    type TSize,
    Rect,
} from "@nealrame/maths"


export type TSceneLayerItem = {
    position: TPoint
    textureIndex: number
}

export interface ISceneLayer {
    readonly scene: IScene
    readonly name: string
    readonly fullname: string

    readonly modified: boolean
    readonly itemCount: number

    readonly data: ArrayBuffer
    readonly dataStorage: GPUBuffer
    readonly uniforms: GPUBuffer
    readonly texture: GPUTexture
    readonly bindGroup: GPUBindGroup
    readonly pipeline: GPURenderPipeline

    clean(): this
    clear(): this
}

export interface ISceneTilemapLayer extends ISceneLayer {
    readonly id: TSceneLayerId<ISceneTilemapLayer>

    set(tile: TSceneLayerItem): this
    unset(tile: TSceneLayerItem): this
}

export interface ISceneSpriteLayer extends ISceneLayer {
    readonly id: TSceneLayerId<ISceneSpriteLayer>

    push(sprite: TSceneLayerItem): this
}

interface ISceneLayerConstraint<T extends ISceneLayer> { }

export type TSceneLayerId<T extends ISceneLayer = ISceneLayer> = symbol & ISceneLayerConstraint<T>
export type TSceneLayerReq<T extends ISceneLayer = ISceneLayer> = symbol & ISceneLayerConstraint<T>

export type TSceneLayerConfig = {
    name: string
    textureImage: ImageBitmap
    textureTileSize: TSize
}

export interface IScene {
    readonly canvas: HTMLCanvasElement

    readonly device: GPUDevice
    readonly context: GPUCanvasContext
    readonly textureFormat: GPUTextureFormat
    readonly uniforms: GPUBuffer

    readonly isRunning: boolean

    readonly cellSize: TSize
    readonly gridSize: TSize
    readonly size: TSize

    viewport: Rect

    addLayer<T extends ISceneLayer>(layerReq: TSceneLayerReq<T>, config: TSceneLayerConfig): T | null
    getLayer<T extends ISceneLayer>(layerId: TSceneLayerId<T>): T | null
    delLayer<T extends ISceneLayer>(layerId: TSceneLayerId<T>): this

    start(tickCallback?: TSceneTickCallback): this
    stop(): this

    render(): this
}

export type TSceneTickCallback = (scene: IScene, time: number) => void
