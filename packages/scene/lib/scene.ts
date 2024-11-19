import {
    type TPoint,
    type TSize,
    Rect,
    Size,
} from "@nealrame/maths"

import {
    SceneTilemapLayerShaderSource,
    SceneSpriteLayerShaderSource,
} from "./shaders"

import type {
    IScene,
    ISceneLayer,
    ISceneSpriteLayer,
    ISceneTilemapLayer,
    TSceneTickCallback,
    TSceneLayerConfig,
    TSceneLayerItem,
    TSceneLayerId,
    TSceneLayerReq,
} from "./types"


function defineLayerKey<T extends ISceneLayer>(): TSceneLayerReq<T> {
    return Symbol() as TSceneLayerReq<T>
}

export const SceneSpriteLayer = defineLayerKey<ISceneSpriteLayer>()
export const SceneTilemapLayer = defineLayerKey<ISceneTilemapLayer>()

function createPipeline(
    layer: ISceneLayer,
    code: string,
): GPURenderPipeline {
    const module = layer.scene.device.createShaderModule({
        label: `${layer.name} - Shader`,
        code,
    })

    return layer.scene.device.createRenderPipeline({
        label: `${layer.name} - Pipeline`,
        layout: "auto",
        vertex: {
            entryPoint: "vertex_shader",
            module,
        },
        fragment: {
            entryPoint: "fragment_shader",
            module,
            targets: [{
                format: layer.scene.textureFormat,
                blend: {
                    alpha: { },
                    color: {
                        operation: "add",
                        srcFactor: "one",
                        dstFactor: "one-minus-src-alpha"
                    },
                },
            }],
        },
    })
}

function createLayerTexture(
    scene: IScene,
    config: TSceneLayerConfig,
): GPUTexture {
    const {
        name,
        textureImage,
    } = config
    const { width, height } = textureImage
    const texture = scene.device.createTexture({
        label: `layer ${name} - texture`,
        size: [width, height],
        format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING
            | GPUTextureUsage.COPY_DST
            | GPUTextureUsage.RENDER_ATTACHMENT,
    })

    scene.device.queue.copyExternalImageToTexture(
        { source: textureImage },
        { texture },
        { width, height },
    )
    return texture
}

function createLayerUniforms(
    scene: IScene,
    config: TSceneLayerConfig,
): GPUBuffer {
    const {
        name,
        textureTileSize,
    } = config
    const { width, height } = textureTileSize

    const values = new ArrayBuffer(8)
    const buffer = scene.device.createBuffer({
        label: `layer ${name} - input uniforms`,
        size: values.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    const views = {
        textureTileSize: new Float32Array(values),
    }

    views.textureTileSize.set([width, height])
    scene.device.queue.writeBuffer(buffer, 0, values)
    return buffer
}

function createLayerBindGroup(
    layer: ISceneLayer,
): GPUBindGroup {
    return layer.scene.device.createBindGroup({
        label: `${layer.fullname} - bind group`,
        layout: layer.pipeline.getBindGroupLayout(0),
        entries: [{
            binding: 0,
            resource: { buffer: layer.scene.uniforms },
        }, {
            binding: 1,
            resource: { buffer: layer.uniforms},
        }, {
            binding: 2,
            resource: { buffer: layer.dataStorage },
        }, {
            binding: 3,
            resource: layer.scene.device.createSampler(),
        }, {
            binding: 4,
            resource: layer.texture.createView(),
        }],
    })
}

///////////////////////////////////////////////////////////////////////////////
// Scene Tilemap Layer ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function createTilemapLayerDataStorage(
    scene: IScene,
    config: TSceneLayerConfig,
): [ArrayBuffer, GPUBuffer] {
    const {
        name,
    } = config
    const { width, height } = scene.gridSize

    const data = new ArrayBuffer(4*height*width)
    const buffer = scene.device.createBuffer({
        label: `layer Tilemap[${name}] - storage buffer`,
        size: data.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })

    return [data, buffer]
}

class SceneTilemapLayerImpl implements ISceneTilemapLayer {
    private modified_ = false

    private name_: string
    private data_: ArrayBuffer
    private dataView_: Int32Array
    private dataStorage_: GPUBuffer
    private uniforms_: GPUBuffer
    private texture_: GPUTexture
    private pipeline_: GPURenderPipeline
    private bindGroup_: GPUBindGroup

    private getTileIndex_(position: TPoint): number {
        return this.scene_.gridSize.width*position.y + position.x
    }

    public constructor(
        private id_: TSceneLayerId<ISceneTilemapLayer>,
        private scene_: IScene,
        config: TSceneLayerConfig,
    ) {
        const [data, dataStorage] = createTilemapLayerDataStorage(this.scene_, config)
        const uniforms = createLayerUniforms(this.scene_, config)
        const texture = createLayerTexture(this.scene_, config)

        this.name_ = config.name

        this.data_ = data
        this.dataView_ = new Int32Array(data)
        this.dataStorage_ = dataStorage
        this.uniforms_ = uniforms
        this.texture_ = texture

        this.pipeline_ = createPipeline(this, SceneTilemapLayerShaderSource)
        this.bindGroup_ = createLayerBindGroup(this)
    }

    public get id(): TSceneLayerId<ISceneTilemapLayer> {
        return this.id_
    }
    
    public get scene(): IScene {
        return this.scene_
    }
    
    public get name(): string {
        return this.name_
    }

    public get fullname(): string {
        return `layer Tilemap[${this.name_}]`
    }

    public get itemCount(): number {
        return this.scene_.gridSize.width*this.scene_.gridSize.height
    }

    public get modified(): boolean {
        return this.modified_
    }

    public get data(): ArrayBuffer {
        return this.data_
    }
    
    public get dataStorage(): GPUBuffer {
        return this.dataStorage_
    }

    public get uniforms(): GPUBuffer {
        return this.uniforms_
    }

    public get texture(): GPUTexture {
        return this.texture_
    }

    public get bindGroup(): GPUBindGroup {
        return this.bindGroup_
    }

    public get pipeline(): GPURenderPipeline {
        return this.pipeline_
    }

    public clean(): this {
        this.modified_ = false
        return this
    }

    public clear(): this {
        this.dataView_.fill(-1)
        this.modified_ = true
        return this
    }

    public set(tile: TSceneLayerItem): this {
        const tileIndex = this.getTileIndex_(tile.position)
        this.dataView_[tileIndex] = tile.textureIndex
        this.modified_ = true
        return this
    }

    public unset(tile: TSceneLayerItem): this {
        const tileIndex = this.getTileIndex_(tile.position)
        this.dataView_[tileIndex] = -1
        this.modified_ = true
        return this
    }
}

///////////////////////////////////////////////////////////////////////////////
// Scene Sprite Layer /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

const kSceneSpriteLayerItemSize = 16
const kSceneSpriteLayerItemMaxCount = 2**16
const kSceneSpriteLayerDataByteSize = kSceneSpriteLayerItemSize*kSceneSpriteLayerItemMaxCount

function createSpriteLayerDataStorage(
    scene: IScene,
    config: TSceneLayerConfig,
): [ArrayBuffer, GPUBuffer] {
    const {
        name,
    } = config

    const data = new ArrayBuffer(kSceneSpriteLayerDataByteSize)
    const buffer = scene.device.createBuffer({
        label: `layer Sprite[${name}] - layer data storage buffer`,
        size: data.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })

    return [data, buffer]
}

class SceneSpriteLayerImpl implements ISceneSpriteLayer {
    private modified_ = false
    private itemsCount_ = 0

    private name_: string
    private data_: ArrayBuffer
    private dataStorage_: GPUBuffer
    private uniforms_: GPUBuffer
    private texture_: GPUTexture
    private pipeline_: GPURenderPipeline
    private bindGroup_: GPUBindGroup

    public constructor(
        private id_: TSceneLayerId<ISceneSpriteLayer>,
        private scene_: IScene,
        config: TSceneLayerConfig,
    ) {
        const [data, dataStorage] = createSpriteLayerDataStorage(this.scene_, config)
        const uniforms = createLayerUniforms(this.scene_, config)
        const texture = createLayerTexture(this.scene_, config)

        this.name_ = config.name

        this.data_ = data
        this.dataStorage_ = dataStorage
        this.uniforms_ = uniforms
        this.texture_ = texture

        this.pipeline_ = createPipeline(this, SceneSpriteLayerShaderSource)
        this.bindGroup_ = createLayerBindGroup(this)
    }

    public get id(): TSceneLayerId<ISceneSpriteLayer> {
        return this.id_
    }

    public get scene(): IScene {
        return this.scene_
    }

    public get name(): string {
        return this.name_
    }
    
    public get fullname(): string {
        return `layer Sprite[${this.name_}]`
    }

    public get modified(): boolean {
        return this.modified_
    }
    
    public get itemCount(): number {
        return this.itemsCount_
    }
    
    public get data(): ArrayBuffer {
        return this.data_
    }
    
    public get dataStorage(): GPUBuffer {
        return this.dataStorage_
    }

    public get uniforms(): GPUBuffer {
        return this.uniforms_
    }
    
    public get texture(): GPUTexture {
        return this.texture_
    }

    public get bindGroup(): GPUBindGroup {
        return this.bindGroup_
    }

    public get pipeline(): GPURenderPipeline {
        return this.pipeline_
    }

    public clean(): this {
        this.modified_ = false
        return this
    }

    public clear(): this {
        this.itemsCount_ = 0
        this.modified_ = true
        return this
    }

    public push(sprite: TSceneLayerItem): this {
        if (this.itemsCount_ < kSceneSpriteLayerItemMaxCount) {
            const itemDataOffset = this.itemsCount_*kSceneSpriteLayerItemSize
            const itemDataView = {
                textureIndex: new Int32Array(this.data_, itemDataOffset + 0, 1),
                position: new Float32Array(this.data_, itemDataOffset + 8, 2),
            }

            itemDataView.textureIndex.set([sprite.textureIndex])
            itemDataView.position.set([sprite.position.x, sprite.position.y])

            this.itemsCount_ =+ 1
        }
        return this
    }
}

export class Scene implements IScene {
    private context_: GPUCanvasContext
    private textureFormat_: GPUTextureFormat

    private uniformsValues_: ArrayBuffer
    private uniforms_: GPUBuffer

    private animationRequestID_: number | null = null
    private running_ = false

    private layers_: Map<TSceneLayerId, ISceneLayer> = new Map()

    private viewport_: Rect
    private gridSize_: Size
    private cellSize_: Size

    private sceneTickCallback_: TSceneTickCallback | null = null
    private animationCallback_ = (time: number) => {
        if (this.running_) {
            this.sceneTickCallback_?.(this, time)
            this.render()
            this.animationRequestID_ = window.requestAnimationFrame(this.animationCallback_)
        }
    }
    
    private constructor(
        gridSize: TSize,
        cellSize: TSize,
        private canvas_: HTMLCanvasElement,
        private device_: GPUDevice,
    ) {
        const format = navigator.gpu.getPreferredCanvasFormat()
        const context = this.canvas_.getContext("webgpu")

        if (context == null) {
            throw new Error("Failed to get a webgpu context!")
        } else {
            context.configure({
                device: this.device_,
                format,
            })
        }

        this.context_ = context
        this.textureFormat_ = format

        this.uniformsValues_ = new ArrayBuffer(32)
        this.uniforms_ = this.device_.createBuffer({
            label: "scene - VS Uniform Buffer",
            size: this.uniformsValues_.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        this.viewport_ = Rect.FromSize(this.canvas)
        this.gridSize_ = Size.FromSize(gridSize)
        this.cellSize_ = Size.FromSize(cellSize)
    }

    public static async create(
        cellSize: TSize,
        gridSize: TSize,
        canvas: HTMLCanvasElement,
    ) {
        const gpu = navigator.gpu
        if (gpu == null) {
            throw new Error("No WebGPU support!")
        }

        const adapter = await gpu.requestAdapter()
        if (adapter == null) {
            throw new Error("No adapter found!")
        }

        const device = await adapter.requestDevice()

        return new Scene(gridSize, cellSize, canvas, device)
    }

    public get isRunning() {
        return this.running_
    }

    public get canvas() {
        return this.canvas_
    }

    public get context() {
        return this.context_
    }

    public get device() {
        return this.device_
    }

    public get viewport() {
        return Rect.FromRect(this.viewport_)
    }

    public set viewport(vp: Rect) {
        const { topLeft, size } = vp
        topLeft.x   = Math.floor(topLeft.x)
        topLeft.y   = Math.floor(topLeft.y)
        size.width  = Math.floor(size.width)
        size.height = Math.floor(size.height)
        this.viewport_ = Rect.FromPointAndSize(topLeft, size)
    }

    public get cellSize(): Size {
        return Size.FromSize(this.cellSize_)
    }

    public get gridSize(): Size {
        return Size.FromSize(this.gridSize_)
    }

    public get size(): TSize {
        return {
            width: this.gridSize_.width*this.cellSize_.width,
            height: this.gridSize_.height*this.cellSize_.height,
        }
    }

    public get uniforms() {
        return this.uniforms_
    }
    
    public get textureFormat() {
        return this.textureFormat_
    }

    public clear(): this {
        for (const layer of this.layers_.values()) {
            layer.dataStorage.destroy()
            layer.uniforms.destroy()
            layer.texture.destroy()
        }
        this.layers_.clear()
        return this
    }

    public addLayer<T extends ISceneLayer>(
        layerReq: TSceneLayerReq<T>,
        config: TSceneLayerConfig,
    ): T | null {
        if (layerReq === SceneSpriteLayer) {
            const id = defineLayerKey<ISceneSpriteLayer>()
            const layer = new SceneSpriteLayerImpl(id, this, config)

            this.layers_.set(id, layer)

            return layer as unknown as T
        }
        
        if (layerReq === SceneTilemapLayer) {
            const id = defineLayerKey<ISceneSpriteLayer>()
            const layer = new SceneTilemapLayerImpl(id, this, config)

            this.layers_.set(id, layer)

            return layer as unknown as T
        }
        
        return null
    }

    public getLayer<T extends ISceneLayer>(
        layerId: TSceneLayerId<T>,
    ): T | null {
        return this.layers_.get(layerId) as T ?? null
    }
    
    public delLayer<T extends ISceneLayer>(
        layerId: TSceneLayerId<T>,
    ): this {
        this.layers_.delete(layerId)
        return this
    }

    public render(): this {
        const uniformsView = {
            cellSize: new Float32Array(this.uniformsValues_, 0, 2),
            gridSize: new Float32Array(this.uniformsValues_, 8, 2),
            viewport: {
                origin: new Float32Array(this.uniformsValues_, 16, 2),
                size: new Float32Array(this.uniformsValues_, 24, 2),
            },
        }

        uniformsView.cellSize.set(this.cellSize.asArray)
        uniformsView.gridSize.set(this.gridSize.asArray)
        uniformsView.viewport.origin.set(this.viewport_.topLeft.asArray)
        uniformsView.viewport.size.set(this.viewport_.size.asArray)

        this.device.queue.writeBuffer(this.uniforms_, 0, this.uniformsValues_)

        const encoder = this.device.createCommandEncoder({
            label: "scene - command encoder",
        })
        const pass = encoder.beginRenderPass({
            label: "scene - render pass",
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                // clearValue: [0, 0, 0, 1],
                loadOp: "clear",
                storeOp: "store",
            }],
        })
        
        for (const layer of this.layers_.values()) {
            if (layer.modified) {
                this.device.queue.writeBuffer(layer.dataStorage, 0, layer.data)
                layer.clean()
            }

            pass.setPipeline(layer.pipeline)
            pass.setBindGroup(0, layer.bindGroup)
            pass.draw(6, layer.itemCount)
        }

        pass.end()

        this.device_.queue.submit([encoder.finish()])
        
        return this
    }

    public start(tickCallback?: TSceneTickCallback): this {
        if (!this.running_) {
            this.running_ = true
            this.sceneTickCallback_ = tickCallback ?? null
            this.animationRequestID_ =
                window.requestAnimationFrame(this.animationCallback_)
        }
        return this
    }

    public stop(): this {
        if (this.running_) {
            this.running_ = false
            this.sceneTickCallback_ = null
            window.cancelAnimationFrame(this.animationRequestID_!)
        }
        return this
    }
}
