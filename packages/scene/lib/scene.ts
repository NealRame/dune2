import {
    type TPoint,
    type TSize,
    Rect,
} from "@nealrame/maths"

import {
    shaderSource,
} from "./shaders.ts"

import {
    type IScene,
    type ISceneLayerHandler,
    type TSceneTickCallback,
} from "./types"


type TSceneLayerConfig = {
    name: string
    size: TSize
    textureImage: ImageBitmap
    textureTileSize: TSize
}

type TSceneLayer = {
    bindGroup: GPUBindGroup
    data: Uint32Array
    dataStorage: GPUBuffer
    modified: boolean
    name: string
}

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
): [Uint32Array, GPUBuffer] {
    const {
        name,
        size: { width, height },
    } = config

    const data = new Uint32Array(height*width)
    const buffer = device.createBuffer({
        label: `layer ${name} - storage buffer`,
        size: data.byteLength,
        usage: GPUBufferUsage.STORAGE
            | GPUBufferUsage.COPY_DST,
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
        usage: GPUBufferUsage.UNIFORM
            | GPUBufferUsage.COPY_DST,
    })

    const views = {
        textureTileSize: new Float32Array(values),
    }

    views.textureTileSize.set([width, height])
    device.queue.writeBuffer(buffer, 0, values)
    return buffer
}

class SceneLayerHandler implements ISceneLayerHandler {
    public constructor(
        private size_: TSize,
        private layerData_: TSceneLayer,
    ) { }

    public set(pos: TPoint, v: number): this {
        const index = this.size_.width*pos.y + pos.x
        this.layerData_.data[index] = v
        this.layerData_.modified = true
        return this
    }
}

export class Scene implements IScene {
    private context_: GPUCanvasContext
    private pipeline_: GPURenderPipeline
    private textureFormat_: GPUTextureFormat
    private sampler_: GPUSampler

    private sceneInputsValues: ArrayBuffer
    private sceneInputsBuffer: GPUBuffer

    private animationRequestID_: number | null = null
    private running_ = false

    private layers_: Array<TSceneLayer> = []

    private viewport_: Rect

    private sceneTickCallback_: TSceneTickCallback | null = null
    private animationCallback_ = (time: number) => {
        if (this.running_) {
            this.sceneTickCallback_?.(this, time)
            this.render()
            this.animationRequestID_ = window.requestAnimationFrame(this.animationCallback_)
        }
    }

    private constructor(
        private gridSize_: TSize,
        private cellSize_: TSize,
        private canvas_: HTMLCanvasElement,
        private device_: GPUDevice,
    ) {
        const format = navigator.gpu.getPreferredCanvasFormat()
        const context = this.canvas_.getContext("webgpu")

        const module = this.device_.createShaderModule({
            label: "Scene shader",
            code: shaderSource,
        })

        if (context == null) {
            throw new Error("Failed to get a webgpu context!")
        } else {
            context.configure({
                device: this.device_,
                format,
            })
        }

        this.context_ = context

        this.pipeline_ = this.device_.createRenderPipeline({
            label: "Scene pipeline",
            layout: "auto",
            vertex: {
                entryPoint: "vertex_shader",
                module,
            },
            fragment: {
                entryPoint: "fragment_shader",
                module,
                targets: [{ format }]
            }
        })

        this.sampler_ = this.device_.createSampler()

        this.sceneInputsValues = new ArrayBuffer(32)
        this.sceneInputsBuffer = this.device_.createBuffer({
            label: "scene - VS Uniform Buffer",
            size: this.sceneInputsValues.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        this.textureFormat_ = format

        this.viewport_ = new Rect(0, 0, this.canvas.width, this.canvas.height)
    }

    public static async create(
        gridSize: TSize,
        cellSize: TSize,
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
        this.viewport_ = Rect.FromRect(vp)
    }

    public get gridSize(): TSize {
        return this.gridSize_
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

    addLayer(
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

        const [layerData, layerDataStorage] = createLayerDataStorage(this.device, config)
        const layerInputsBuffer = createLayerInputUniforms(this.device, config)
        const texture = createLayerTexture(this.device, config)

        const bindGroup = this.device.createBindGroup({
            label: `layer ${name} - bind group`,
            layout: this.pipeline_.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: { buffer: this.sceneInputsBuffer },
                },
                {
                    binding: 1,
                    resource: { buffer: layerInputsBuffer},
                },
                {
                    binding: 2,
                    resource: { buffer: layerDataStorage },
                },
                {
                    binding: 3,
                    resource: this.sampler_,
                },
                {
                    binding: 4,
                    resource: texture.createView(),
                }
            ],
        })

        const layer: TSceneLayer = {
            bindGroup,
            data: layerData,
            dataStorage: layerDataStorage,
            modified: false,
            name,
        }

        this.layers_.push(layer)

        return this
    }

    getLayerByIndex(index: number): ISceneLayerHandler | null {
        if (index >= 0 && index < this.layers_.length) {
            return new SceneLayerHandler(this.gridSize, this.layers_[index])
        }
        return null
    }

    getLayerByName(name: string): ISceneLayerHandler | null {
        return this.getLayerByIndex(
            this.layers_.findIndex(layer => layer.name === name)
        )
    }

    public render() {
        const inputsValuesViews = {
            viewport: {
                origin: new Float32Array(this.sceneInputsValues, 0, 2),
                size: new Float32Array(this.sceneInputsValues, 8, 2),
            },
            cellSize: new Float32Array(this.sceneInputsValues, 16, 2),
            gridSize: new Float32Array(this.sceneInputsValues, 24, 2),
        }

        inputsValuesViews.viewport.origin.set([this.viewport_.leftX, this.viewport_.topY])
        inputsValuesViews.viewport.size.set([this.viewport_.width, this.viewport_.height])

        inputsValuesViews.cellSize.set([this.cellSize_.width, this.cellSize_.height])
        inputsValuesViews.gridSize.set([this.gridSize.width, this.gridSize.height])

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
        }

        for (const layer of this.layers_) {
            pass.setPipeline(this.pipeline_)
            pass.setBindGroup(0, layer.bindGroup)
            pass.draw(6, this.gridSize.width*this.gridSize.height)
        }

        pass.end()

        this.device_.queue.submit([encoder.finish()])
    }

    public start() {
        if (!this.running_) {
            this.running_ = true
            this.animationRequestID_ =
                window.requestAnimationFrame(this.animationCallback_)
        }
    }

    public stop() {
        if (this.running_) {
            this.running_ = false
            window.cancelAnimationFrame(this.animationRequestID_!)
        }
    }
}
