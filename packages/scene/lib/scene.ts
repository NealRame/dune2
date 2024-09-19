import {
    TPoint,
    TSize,
} from "@nealrame/maths"

import {
    shaderSource,
} from "./shaders.ts"

import {
    type IScene,
    type ISceneLayer,
    type TSceneTickCallback,
} from "./types"


export class SceneLayer implements ISceneLayer {
    public data: Uint16Array
    public texture: GPUTexture

    public constructor(
        bitmap: ImageBitmap,
        public name: string,
        private scene_: Scene,
    ) {
        { // init layer array buffer
            const { width, height } = this.scene_.size
            this.data = new Uint16Array(height * width)
        }
        { // init layer texture
            const device = this.scene_.device
            const { width, height } = bitmap

            this.texture = device.createTexture({
                label: name,
                size: [width, height],
                format: "rgba8unorm",
                usage: GPUTextureUsage.TEXTURE_BINDING
                    | GPUTextureUsage.COPY_DST
                    | GPUTextureUsage.RENDER_ATTACHMENT,
            })

            device.queue.copyExternalImageToTexture(
                { source: bitmap, flipY: true, },
                { texture: this.texture, },
                { width, height, },
            )
        }
    }

    public set(pos: TPoint, v: number): this {
        const index = this.scene_.size.width * pos.x + pos.y

        this.data[index] = v

        return this
    }
}

export class Scene implements IScene {
    private context_: GPUCanvasContext
    private textureFormat_: GPUTextureFormat
    private pipeline_: GPURenderPipeline

    private animationRequestID_: number | null = null
    private running_ = false

    private layers_: Array<SceneLayer> = []

    private sceneTickCallback_: TSceneTickCallback | null = null
    private animationCallback_ = (time: number) => {
        if (this.running_) {
            this.sceneTickCallback_?.(this, time)
            this.render()
            this.animationRequestID_ = window.requestAnimationFrame(this.animationCallback_)
        }
    }

    private constructor(
        private size_: TSize,
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

        this.textureFormat_ = format
        this.context_ = context

        const module = this.device_.createShaderModule({
            label: "Scene shader",
            code: shaderSource,
        })

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
                targets: [{ format: this.textureFormat }]
            }
        })
    }

    public static async create(size: TSize, canvas: HTMLCanvasElement) {
        const gpu = navigator.gpu
        if (gpu == null) {
            throw new Error("No WebGPU support!")
        }

        const adapter = await gpu.requestAdapter()
        if (adapter == null) {
            throw new Error("No adapter found!")
        }

        const device = await adapter.requestDevice()

        return new Scene(size, canvas, device)
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

    public get size(): TSize {
        return this.size_
    }

    public get textureFormat() {
        return this.textureFormat_
    }

    addLayer(name: string, bitmap: ImageBitmap): ISceneLayer {
        if (this.getLayerByName(name) != null) {
            throw new Error(`layer '${name}' already exists!`)
        }

        const layer = new SceneLayer(bitmap, name, this)

        this.layers_.push()
        return layer
    }

    getLayerByIndex(index: number): ISceneLayer | null {
        return index < this.layers_.length
            ? this.layers_[index]
            : null
    }

    getLayerByName(name: string): ISceneLayer | null {
        const index = this.layers_.findIndex(layer => layer.name === name)

        return index >= 0
            ? this.layers_[index]
            : null
    }

    public render() {
        const device = this.device

        const inputsValues = new ArrayBuffer(40)
        const inputsValuesViews = {
            viewport: {
                offset: new Float32Array(inputsValues, 0, 2),
                size: new Float32Array(inputsValues, 8, 2),
            },
            textureTileSize: new Float32Array(inputsValues, 16, 2),
            mapTileSize: new Float32Array(inputsValues, 24, 2),
            mapSize: new Float32Array(inputsValues, 32, 2),
        }

        inputsValuesViews.viewport.offset.set([0, 0])
        inputsValuesViews.viewport.size.set([this.canvas.width, this.canvas.height])
        inputsValuesViews.textureTileSize.set([16, 16])
        inputsValuesViews.mapTileSize.set([16, 16])
        inputsValuesViews.mapSize.set([this.size.width, this.size.height])

        const inputsBuffer = device.createBuffer({
            label: "scene - VS Uniform Buffer",
            size: inputsValues.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })
        this.device.queue.writeBuffer(inputsBuffer, 0, inputsValues)

        const bindGroup = this.device.createBindGroup({
            label: "scene - bind group",
            layout: this.pipeline_.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: { buffer: inputsBuffer },
            }],
        })

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

        pass.setPipeline(this.pipeline_)
        pass.setBindGroup(0, bindGroup)
        pass.draw(6, this.size.width*this.size.height)
        // pass.draw(6, 2)
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
