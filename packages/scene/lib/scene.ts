import {
    type TPoint,
    type TSize,
    Rect,
    Size,
} from "@nealrame/maths"

import {
    SceneTilemapLayerShaderSource,
} from "./shaders"

import {
    type IScene,
    type ISceneLayerHandler,
    type TSceneTickCallback,
} from "./types"


interface ISceneLayerConstraint<T> {}

export type TSceneLayerKey<T = unknown> = symbol & ISceneLayerConstraint<T>


export type TSceneLayerConfig = {
    name: string
    size: TSize
    textureImage: ImageBitmap
    textureTileSize: TSize
}

type TSceneLayer = {
    data: ArrayBuffer
    dataStorage: GPUBuffer
    bindGroup: GPUBindGroup
    pipeline: GPURenderPipeline
    modified: boolean
    name: string
}

export const SceneTilemapLayer: TSceneLayerKey = Symbol()
export const SceneSpriteLayer: TSceneLayerKey = Symbol("Sprite layer")

const SceneLayerShaderSources = [
    [SceneTilemapLayer, SceneTilemapLayerShaderSource, "Tilemap layer"],
    // [SceneSpriteLayer,  SceneSpriteLayerShaderSource,  "Sprite layer"],
] as const

function createLayerTexture(
    device: GPUDevice,
    config: TSceneLayerConfig,
): GPUTexture {
    const {
        name,
        textureImage,
    } = config
    const { width, height } = textureImage
    const texture = device.createTexture({
        label: `layer ${name} - texture`,
        size: [width, height],
        format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING
            | GPUTextureUsage.COPY_DST
            | GPUTextureUsage.RENDER_ATTACHMENT,
    })

    device.queue.copyExternalImageToTexture(
        { source: textureImage },
        { texture },
        { width, height },
    )
    return texture
}

function createLayerDataStorage(
    device: GPUDevice,
    config: TSceneLayerConfig,
): [ArrayBuffer, GPUBuffer] {
    const {
        name,
        size: { width, height },
    } = config

    const data = new ArrayBuffer(4*height*width)
    const buffer = device.createBuffer({
        label: `layer ${name} - storage buffer`,
        size: data.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })

    return [data, buffer]
}

function createLayerInputUniforms(
    device: GPUDevice,
    config: TSceneLayerConfig,
): GPUBuffer {
    const {
        name,
        textureTileSize,
    } = config
    const { width, height } = textureTileSize

    const values = new ArrayBuffer(8)
    const buffer = device.createBuffer({
        label: `layer ${name} - input uniforms`,
        size: values.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    const views = {
        textureTileSize: new Float32Array(values),
    }

    views.textureTileSize.set([width, height])
    device.queue.writeBuffer(buffer, 0, values)
    return buffer
}

class SceneLayerHandler implements ISceneLayerHandler {
    private layerDataView_: Int32Array

    public constructor(
        private size_: TSize,
        private layerData_: TSceneLayer,
    ) {
        this.layerDataView_ = new Int32Array(this.layerData_.data)
    }

    public set(pos: TPoint, v: number): this {
        const index = this.size_.width*pos.y + pos.x
        this.layerDataView_[index] = v
        this.layerData_.modified = true
        return this
    }
}

export class Scene implements IScene {
    private context_: GPUCanvasContext
    // private pipeline_: GPURenderPipeline
    private pipelines_: Record<symbol, GPURenderPipeline>
    private textureFormat_: GPUTextureFormat
    private sampler_: GPUSampler

    private sceneInputsValues: ArrayBuffer
    private sceneInputsBuffer: GPUBuffer

    private animationRequestID_: number | null = null
    private running_ = false

    private layers_: Array<TSceneLayer> = []

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

    private createPipeline_(
        code: string,
        label: string,
    ): GPURenderPipeline {
        const module = this.device.createShaderModule({
            label: `${label} - Shader`,
            code,
        })

        return this.device.createRenderPipeline({
            label: `${label} - Pipeline`,
            layout: "auto",
            vertex: {
                entryPoint: "vertex_shader",
                module,
            },
            fragment: {
                entryPoint: "fragment_shader",
                module,
                targets: [{
                    format: this.textureFormat_,
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

        this.pipelines_ = Object.assign(
            { },
            ...SceneLayerShaderSources.map(([key, code, label]) => [{
                [key]: this.createPipeline_(code, label)
            }]),
        )

        this.sampler_ = this.device_.createSampler()

        this.sceneInputsValues = new ArrayBuffer(32)
        this.sceneInputsBuffer = this.device_.createBuffer({
            label: "scene - VS Uniform Buffer",
            size: this.sceneInputsValues.byteLength,
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

    public get textureFormat() {
        return this.textureFormat_
    }

    public addLayer(
        name: string,
        textureImage: ImageBitmap,
        textureTileSize: TSize,
    ): IScene {
        if (this.getLayerByName(name) != null) {
            throw new Error(`layer '${name}' already exists!`)
        }

        const config: TSceneLayerConfig = {
            name,
            size: this.gridSize,
            textureImage,
            textureTileSize,
        }

        const pipeline = this.pipelines_[SceneTilemapLayer]
        
        const [layerData, layerDataStorage] = createLayerDataStorage(this.device, config)
        const layerInputsBuffer = createLayerInputUniforms(this.device, config)
        const texture = createLayerTexture(this.device, config)

        const bindGroup = this.device.createBindGroup({
            label: `layer ${name} - bind group`,
            layout: pipeline.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: { buffer: this.sceneInputsBuffer },
            }, {
                binding: 1,
                resource: { buffer: layerInputsBuffer},
            }, {
                binding: 2,
                resource: { buffer: layerDataStorage },
            }, {
                binding: 3,
                resource: this.sampler_,
            }, {
                binding: 4,
                resource: texture.createView(),
            }],
        })

        const layer: TSceneLayer = {
            data: layerData,
            dataStorage: layerDataStorage,
            bindGroup,
            pipeline,
            modified: false,
            name,
        }

        this.layers_.push(layer)

        return this
    }

    public getLayerByIndex(index: number): ISceneLayerHandler | null {
        if (index >= 0 && index < this.layers_.length) {
            return new SceneLayerHandler(this.gridSize, this.layers_[index])
        }
        return null
    }

    public getLayerByName(name: string): ISceneLayerHandler | null {
        return this.getLayerByIndex(
            this.layers_.findIndex(layer => layer.name === name)
        )
    }

    public render() {
        const inputsValuesViews = {
            cellSize: new Float32Array(this.sceneInputsValues, 0, 2),
            gridSize: new Float32Array(this.sceneInputsValues, 8, 2),
            viewport: {
                origin: new Float32Array(this.sceneInputsValues, 16, 2),
                size: new Float32Array(this.sceneInputsValues, 24, 2),
            },
        }

        inputsValuesViews.cellSize.set(this.cellSize.asArray)
        inputsValuesViews.gridSize.set(this.gridSize.asArray)
        inputsValuesViews.viewport.origin.set(this.viewport_.topLeft.asArray)
        inputsValuesViews.viewport.size.set(this.viewport_.size.asArray)

        this.device.queue.writeBuffer(this.sceneInputsBuffer, 0, this.sceneInputsValues)

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

        for (const layer of this.layers_) {
            if (layer.modified) {
                this.device.queue.writeBuffer(layer.dataStorage, 0, layer.data)
                layer.modified = false
            }
            pass.setPipeline(layer.pipeline)
            pass.setBindGroup(0, layer.bindGroup)
            pass.draw(6, this.gridSize.width*this.gridSize.height)
        }

        pass.end()

        this.device_.queue.submit([encoder.finish()])
    }

    public start(tickCallback?: TSceneTickCallback) {
        if (!this.running_) {
            this.running_ = true
            this.sceneTickCallback_ = tickCallback ?? null
            this.animationRequestID_ =
                window.requestAnimationFrame(this.animationCallback_)
        }
    }

    public stop() {
        if (this.running_) {
            this.running_ = false
            this.sceneTickCallback_ = null
            window.cancelAnimationFrame(this.animationRequestID_!)
        }
    }
}
