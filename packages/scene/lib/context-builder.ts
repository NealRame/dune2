import {
    Context,
} from "./context"

import * as Events from "./events"

import {
    type TSize,
} from "./types"

export class ContextBuilder {
    private _size: TSize | null = null
    private _eventsAccepted: number | null = null

    withSize(size: TSize): ContextBuilder
    withSize(width: number, height: number): ContextBuilder
    withSize(param: number | TSize, height?: number): ContextBuilder {
        if (typeof param === "number") {
            this._size = {
                width: param,
                height: height!,
            }
        } else {
            this._size = param
        }
        return this
    }

    withEventsAccepted(eventsAccepted: number): ContextBuilder {
        this._eventsAccepted = eventsAccepted
        return this
    }

    build(queryString: string): Context
    build(canvas: HTMLCanvasElement): Context
    build(param: HTMLCanvasElement | string): Context {
        let canvas: HTMLCanvasElement

        if (typeof param === "string") {
            const queryString = param
            const element = document.querySelector(queryString)
            if (!element) {
                throw new Error(
                    `Element not found for query string '${queryString}'`
                )
            }
            if (!(element instanceof HTMLCanvasElement)) {
                throw new Error(
                    `Element for query string '${queryString}' is not a canvas`
                )
            }
            canvas = element
        } else {
            canvas = param
        }

        const eventsAccepted = this._eventsAccepted ?? Events.All
        const size = this._size ?? {
            width: canvas.width,
            height: canvas.height,
        }

        return new Context(
            canvas,
            size,
            eventsAccepted,
        )
    }
}