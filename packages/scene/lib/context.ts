import * as Events from "./events"
import type {
    TEvent,
} from "./events"

import type {
    TPoint,
    TSize,
} from './types'

import {
    Painter,
} from './painter'

export class Context {
    private _context: CanvasRenderingContext2D

    private _eventQueue: TEvent[] = []

    private _key: string | null = null
    private _mouse: TPoint | null = null
    private _mouseButtonDown: boolean = false

    private _painter: Painter

    private _onKeyDown = (event: KeyboardEvent) => {
        this._key = event.key
        this._eventQueue.push({
            type: Events.KeyDown,
            key: event.key,
        } as TEvent)
    }

    private _onKeyUp = (event: KeyboardEvent) => {
        this._key = event.key
        this._eventQueue.push({
            type: Events.KeyUp,
            key: event.key,
        } as TEvent)
    }

    private _onMouseDown = () => {
        this._mouseButtonDown = true
        this._eventQueue.push({
            type: Events.MouseButtonDown,
        } as TEvent)
    }

    private _onMouseUp = () => {
        this._mouseButtonDown = false
        this._eventQueue.push({
            type: Events.MouseButtonUp,
        } as TEvent)
    }

    private _onMouseMove = (event: MouseEvent) => {
        this._mouse = {
            x: event.offsetX,
            y: event.offsetY,
        }
    }

    private _onMouseWheel = (event: WheelEvent) => {
        this._eventQueue.push({
            type: Events.MouseWheel,
            deltaX: event.deltaX,
            deltaY: event.deltaY,
        } as TEvent)
    }

    public constructor(
        private _canvas: HTMLCanvasElement,
        size: TSize,
    ) {
        this._context = _canvas.getContext("2d") as CanvasRenderingContext2D
        this._painter = new Painter(this._context)
        this.size = size
    }

    public *events(filter: Events.TEventFilter = () => true) {
        for (const event of this._eventQueue) {
            if (filter(event.type)) {
                yield event
            }
        }
    }

    public bind() {
        this._canvas.addEventListener("mousedown", this._onMouseDown)
        this._canvas.addEventListener("mouseup", this._onMouseUp)
        this._canvas.addEventListener("mousemove", this._onMouseMove)
        this._canvas.addEventListener("wheel", this._onMouseWheel)
        window.addEventListener("keydown", this._onKeyDown)
        window.addEventListener("keyup", this._onKeyUp)
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

    public set size(value: TSize) {
        this._canvas.width = value.width
        this._canvas.height = value.height
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