import type {
    TPoint,
    TSize,
} from './types'

import {
    Painter,
} from './painter'

export class Context {
    private _painter: Painter
    private _context: CanvasRenderingContext2D
    private _key: string | null = null
    private _mouse: TPoint | null = null
    private _mouseButtonDown: boolean = false

    private _onKeyUp = (event: KeyboardEvent) => {
        this._key = event.key
    }

    private _onMouseDown = () => {
        this._mouseButtonDown = true
    }

    private _onMouseUp = () => {
        this._mouseButtonDown = false
    }

    private _onMouseMove = (event: MouseEvent) => {
        this._mouse = {
            x: event.offsetX,
            y: event.offsetY,
        }
    }

    public constructor(
        private _canvas: HTMLCanvasElement,
        size: TSize,
    ) {
        this._context = _canvas.getContext('2d') as CanvasRenderingContext2D
        this._painter = new Painter(this._context)
        this.size = size
    }

    public bind() {
        this._canvas.addEventListener('mousedown', this._onMouseDown)
        this._canvas.addEventListener('mouseup', this._onMouseUp)
        this._canvas.addEventListener('mousemove', this._onMouseMove)
        window.addEventListener('keyup', this._onKeyUp)
    }

    public unbind() {
        this._canvas.removeEventListener('mousedown', this._onMouseDown)
        this._canvas.removeEventListener('mouseup', this._onMouseUp)
        this._canvas.removeEventListener('mousemove', this._onMouseMove)
        window.removeEventListener('keyup', this._onKeyUp)
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