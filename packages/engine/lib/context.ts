import * as Events from "./events"
import type {
    TEvent,
} from "./events"

import type {
    TPoint,
    TSize,
} from "./maths"

import {
    Painter,
} from "./graphics/painter"

export type TContextOptions = {
    canvas: HTMLCanvasElement,
    eventsAccepted?: number,
    size?: TSize,
}

export class Context {
    private _canvas: HTMLCanvasElement

    private _eventQueue: TEvent[] = []
    private _eventsAccepted: number

    private _key: string | null = null
    private _mouse: TPoint | null = null
    private _mouseButtonDown: boolean = false

    private _painter: Painter

    private _onKeyDown = (event: KeyboardEvent) => {
        if (event.target === document.body) {
            event.preventDefault()
            this._key = event.key
            this._eventQueue.push({
                type: Events.KeyDown,
                key: event.key,
            } as TEvent)
        }
    }

    private _onKeyUp = (event: KeyboardEvent) => {
        if (event.target === document.body) {
            event.preventDefault()
            this._key = event.key
            this._eventQueue.push({
                type: Events.KeyUp,
                key: event.key,
            } as TEvent)
        }
    }

    private _onMouseDown = (event: MouseEvent) => {
        event.preventDefault()
        this._mouseButtonDown = true
        this._eventQueue.push({
            type: Events.MouseButtonDown,
        } as TEvent)
    }

    private _onMouseUp = (event: MouseEvent) => {
        event.preventDefault()
        this._mouseButtonDown = false
        this._eventQueue.push({
            type: Events.MouseButtonUp,
        } as TEvent)
    }

    private _onMouseMove = (event: MouseEvent) => {
        event.preventDefault()
        this._mouse = {
            x: event.offsetX,
            y: event.offsetY,
        }
    }

    private _onMouseWheel = (event: WheelEvent) => {
        event.preventDefault()
        this._eventQueue.push({
            type: Events.MouseWheel,
            deltaX: event.deltaX,
            deltaY: event.deltaY,
        } as TEvent)
    }

    public constructor(options: TContextOptions) {
        this._canvas = options.canvas
        this._eventsAccepted = options.eventsAccepted ?? Events.All
        this._painter = new Painter(this._canvas)
        this.size = options.size ?? {
            width: this._canvas.width,
            height: this._canvas.height,
        }
    }

    public *events(filter: Events.TEventFilter = () => true) {
        for (const event of this._eventQueue) {
            if (filter(event.type)) {
                yield event
            }
        }
    }

    public bind() {
        if (this._eventsAccepted & Events.MouseButtonDown) {
            this._canvas.addEventListener("mousedown", this._onMouseDown)
        }
        if (this._eventsAccepted & Events.MouseButtonUp) {
            this._canvas.addEventListener("mouseup", this._onMouseUp)
        }
        if (this._eventsAccepted & Events.MouseMotion) {
            this._canvas.addEventListener("mousemove", this._onMouseMove)
        }
        if (this._eventsAccepted & Events.MouseWheel) {
            this._canvas.addEventListener("wheel", this._onMouseWheel, {
                passive: false
            })
        }
        if (this._eventsAccepted & Events.KeyDown) {
            window.addEventListener("keydown", this._onKeyDown)
        }
        if (this._eventsAccepted & Events.KeyUp) {
            window.addEventListener("keyup", this._onKeyUp)
        }
        this._canvas.focus()
    }

    public unbind() {
        this._canvas.removeEventListener("mousedown", this._onMouseDown)
        this._canvas.removeEventListener("mouseup", this._onMouseUp)
        this._canvas.removeEventListener('mousemove', this._onMouseMove)
        this._canvas.removeEventListener("wheel", this._onMouseWheel)
        window.removeEventListener("keydown", this._onKeyDown)
        window.removeEventListener("keyup", this._onKeyUp)
    }

    public clearKey() {
        this._key = null
    }

    public clearMouse() {
        this._mouse = null
    }

    public clear() {
        this.clearKey()
        this.clearMouse()
        this._eventQueue.splice(0)
    }

    public get size(): TSize {
        return {
            width: this._canvas.width,
            height: this._canvas.height,
        }
    }

    public set size(size: TSize) {
        this._canvas.width = size.width
        this._canvas.height = size.height
        this._eventQueue.push({
            type: Events.Resize,
            size,
        } as TEvent)
    }

    public get width(): number {
        return this._canvas.width
    }

    public get height(): number {
        return this._canvas.height
    }

    public get painter(): Painter {
        return this._painter
    }

    public get key(): string | null {
        return this._key
    }

    public get mouse(): TPoint | null {
        return this._mouse
    }

    public get mouseButtonDown(): boolean {
        return this._mouseButtonDown
    }
}