import * as Color from "./color"

import {
    type TColor,
    type TPoint,
    type TRect,
    type TSize,
} from "./types"

export class Painter {
    private _fillColor = Color.Black
    private _strokeColor = Color.Black

    public constructor(
        private _context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
    ) {
        this._context.strokeStyle = Color.cssHex(this._strokeColor)
        this._context.fillStyle = Color.cssHex(this._fillColor)
    }

    public get fillColor(): TColor {
        return this._fillColor
    }

    public set fillColor(color: TColor) {
        this._fillColor = color
        this._context.fillStyle = Color.cssHex(this._fillColor)
    }

    public setFillColor(
        color: TColor,
    ): Painter {
        this.fillColor = color
        return this
    }

    public get strokeColor(): TColor {
        return this._strokeColor
    }

    public set strokeColor(color: TColor) {
        this._strokeColor = color
        this._context.strokeStyle = Color.cssHex(this._strokeColor)
    }

    public setStrokeColor(
        color: TColor,
    ): Painter {
        this.strokeColor = color
        return this
    }

    public get rect(): TRect {
        return {
            x: 0,
            y: 0,
            ...this.size
        }
    }

    public get size(): TSize {
        return {
            width: this._context.canvas.width,
            height: this._context.canvas.height,
        }
    }

    public clear(): Painter {
        this._context.clearRect(
            0,
            0,
            this._context.canvas.width,
            this._context.canvas.height,
        )
        return this
    }

    public drawRect({
        x,
        y,
        width,
        height
    }: TRect): Painter {
        this._context.strokeRect(x, y, width, height)
        return this
    }

    public fillRect({
        x,
        y,
        width,
        height
    }: TRect): Painter {
        this._context.fillRect(x, y, width, height)
        return this
    }

    public drawLine({
        x: x1,
        y: y1,
    }: TPoint, {
        x: x2,
        y: y2,
    }: TPoint): Painter {
        this._context.beginPath()
        this._context.moveTo(x1, y1)
        this._context.lineTo(x2, y2)
        this._context.stroke()
        return this
    }

    public getPixel({
        x,
        y,
    }: TPoint): TColor {
        const [r, g, b, a] = this._context.getImageData(x, y, 1, 1).data
        return {
            r,
            g,
            b,
            a,
        }
    }

    public putPixel(point: TPoint, color: TColor): Painter {
        const { r, g, b, a } = color
        const imageData = this._context.getImageData(point.x, point.y, 1, 1)
        imageData.data[0] = r
        imageData.data[1] = g
        imageData.data[2] = b
        imageData.data[3] = a
        return this
    }

    public drawImage(
        point: TPoint,
        image: ImageBitmap | ImageData,
    ): Painter {
        if (image instanceof ImageData) {
            this._context.putImageData(image, point.x, point.y)
        } else {
            this._context.drawImage(image, point.x, point.y)
        }
        return this
    }
}
