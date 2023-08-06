import {
    type TPoint,
    type TRect,
    type TSize,
} from "../maths"

import {
    Color,
    type TRGBAColor,
} from "./color"

export class Painter {
    private _context: CanvasRenderingContext2D
    private _fillColor!: Color
    private _strokeColor!: Color

    public constructor(
        canvas: HTMLCanvasElement,
    ) {
        this._context = canvas.getContext("2d") as CanvasRenderingContext2D
        this.strokeColor = Color.black
        this.fillColor = Color.black
    }

    public get fillColor(): TRGBAColor {
        return this._fillColor
    }

    public set fillColor(color: TRGBAColor) {
        this._fillColor = Color.fromColor(color)
        this._context.fillStyle = this._fillColor.toHexString()
    }

    public setFillColor(
        color: TRGBAColor,
    ): Painter {
        this.fillColor = color
        return this
    }

    public get strokeColor(): TRGBAColor {
        return this._strokeColor
    }

    public set strokeColor(color: TRGBAColor) {
        this._strokeColor = Color.fromColor(color)
        this._context.strokeStyle = this._strokeColor.toHexString()
    }

    public setStrokeColor(
        color: TRGBAColor,
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
    }: TPoint): TRGBAColor {
        const [r, g, b, a] = this._context.getImageData(x, y, 1, 1).data
        return {
            r,
            g,
            b,
            a,
        }
    }

    public putPixel(point: TPoint, color: TRGBAColor): Painter {
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
