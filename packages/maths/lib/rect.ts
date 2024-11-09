import type {
    TPoint,
    TRect,
    TSize,
    TVector,
} from "./types"

import {
    Size,
} from "./size"

import {
    Vector,
} from "./vector"


export class Rect implements TRect {
    /**
     * Creates a new `Rect` instance from the given `TRect` object.
     *
     * @param rect - A `TRect` like object.
     * @returns A new `Rect`.
     */
    public static FromRect({ x, y, width, height }: TRect): Rect {
        return new Rect(x, y, width, height)
    }

    /**
     * Creates a new `Rect` instance from given `TPoint` and `TSize` objects.
     *
     * @param topLeft - A `TPoint` like object.
     * @param size - A `TSize` like object.
     * @returns A new `Rect`.
     */
    public static FromPointAndSize(topLeft: TPoint, size: TSize): Rect {
        return new Rect(topLeft.x, topLeft.y, size.width, size.height)
    }

    /**
     * Creates a new `Rect` instance from two given `TPoint` objects.
     *
     * @param a - A `TPoint` like object.
     * @param b - A `TPoint` like object.
     * @returns A new `Rect`.
     */
    public static FromPoints(a: TPoint, b: TPoint): Rect {
        const x = Math.min(a.x, b.x)
        const y = Math.min(a.y, b.y)
        const w = Math.abs(a.x - b.x)
        const h = Math.abs(a.y - b.y)

        return new Rect(x, y, w, h)
    }

    /**
     * Constructs a new rectangle with the specified top-left corner and size.
     * 
     * @param topLeft - The top-left corner of the rectangle.
     * @param size - The size of the rectangle.
     */
    public constructor(
        /**
         * The top-left point x-coordinate.
         */
        public x: number,
        /**
         * The top-left point y-coordinate.
         */
        public y: number,
        /**
         * The width of the rectangle.
         */
        public width: number,
        /**
         * The height of the rectangle.
         */
        public height: number,
    ) {}

    /**
     * Returns the vector as an array of four numbers.
     */
    public get asArray(): [number, number, number, number] {
        return [
            this.x,
            this.y,
            this.width,
            this.height,
        ]
    }

    /**
     * Gets the size of the rectangle.
     * 
     * @returns The size of the rectangle.
     */
    public get size(): Size {
        return new Size(this.width, this.height)
    }

    /**
     * Gets the area of the rectangle.
     * 
     * @returns The area of the rectangle.
     */
    public get area(): number {
        return this.width*this.height
    }

    /**
     * Gets the x-coordinate of the left edge of the rectangle.
     * 
     * @returns The x-coordinate of the left edge.
     */
    public get leftX(): number {
        return this.x
    }

    /**
     * Gets the x-coordinate of the right edge of the rectangle.
     * 
     * @returns The x-coordinate of the right edge.
     */
    public get rightX(): number {
        return this.x + this.width
    }

    /**
     * Gets the y-coordinate of the top edge of the rectangle.
     *
     * @returns The y-coordinate of the top edge.
     */
    public get topY(): number {
        return this.y
    }

    /**
     * Gets the y-coordinate of the bottom edge of the rectangle.
     * 
     * @returns The y-coordinate of the bottom edge.
     */
    public get bottomY(): number {
        return this.y + this.height
    }

    /**
     * Gets the top-left corner point of the rectangle.
     *
     * @returns The top-left point of the rectangle.
     */
    public get topLeft(): Vector {
        return new Vector(this.leftX, this.topY)
    }

    /**
     * Gets the top-right corner point of the rectangle.
     *
     * @returns The top-right point of the rectangle.
     */
    public get topRight(): Vector {
        return new Vector(this.rightX, this.topY)
    }

    /**
     * Gets the bottom-left corner point of the rectangle.
     *
     * @returns The bottom-left point of the rectangle.
     */
    public get bottomLeft(): Vector {
        return new Vector(this.leftX, this.bottomY)
    }

    /**
     * Gets the bottom-right corner point of the rectangle.
     *
     * @returns The bottom-right point of the rectangle.
     */
    public get bottomRight(): Vector {
        return new Vector(this.rightX, this.bottomY)
    }

    /**
     * Gets the center point of the rectangle.
     * 
     * @returns The center point of the rectangle.
     */
    public get center(): Vector {
        return new Vector(
            (this.leftX + this.rightX)/2,
            (this.topY + this.bottomY)/2,
        )
    }

    /**
     * Checks if a given point is within the bounds of the rectangle.
     *
     * @param p - A point.
     * @returns Returns `true` if the point is within the
     * rectangle, otherwise `false`.
     */
    public contains({ x, y }: TPoint): boolean {
        return x >= this.leftX && x <= this.rightX
            && y >= this.topY  && y <= this.bottomY
    }

    /**
     * Determines if this rectangle overlaps with another rectangle.
     *
     * @param rect - The rectangle to check for overlap with.
     * @returns `true` if the rectangles overlap, `false` otherwise.
     */
    public overlap(rect: Rect): boolean {
        const ax1 = this.leftX
        const ay1 = this.topY
        const ax2 = this.rightX
        const ay2 = this.bottomY
        const bx1 = rect.leftX
        const by1 = rect.topY
        const bx2 = rect.rightX
        const by2 = rect.bottomY
        return ((ax2 >= bx1 && ax2 <= bx2) || (bx2 >= ax1 && bx2 <= ax2))
            && ((ay2 >= by1 && ay2 <= by2) || (by2 >= ay1 && by2 <= ay2))
    }

    /**
     * Crops the rectangle to the specified width and height.
     *
     * @param size - An object containing the new width and height.
     * @returns The modified rectangle instance.
     */
    public mutCrop({ width, height }: TSize): Rect {
        this.width = width
        this.height = height
        return this
    }

    /**
     * Gets a new Rect which is the result of the rect cropped to the specified
     * width and height.
     *
     * @param size - An object containing the width and height to crop
     * the rectangle to.
     * @returns A new `Rect` instance cropped to the specified dimensions.
     */
    public crop(size: TSize): Rect {
        return Rect.FromRect(this).mutCrop(size)
    }

    /**
     * Translates the rectangle by the given vector.
     *
     * @param v - The vector by which to translate the rectangle.
     * @returns The translated rectangle.
     */
    public mutTranslate({ x, y }: TVector) : Rect {
        this.x += x
        this.y += y
        return this
    }

    /**
     * Translates the current rectangle by a given vector.
     *
     * @param v - The vector by which to translate the rectangle.
     * @returns A new `Rect` instance that is translated by the given
     * vector.
     */
    public translate(v: TVector): Rect {
        return Rect.FromRect(this).mutTranslate(v)
    }

    /**
     * Scales the current rectangle by the given factor(s).
     *
     * @param k - The scaling factor(s). It can be either:
     *   - An object with `kx` and `ky` properties representing the scaling
     *     factors for the x and y axes respectively.
     *   - A single number to uniformly scale both axes.
     * @returns The scaled rectangle.
     */
    public mutScale(k: {kx: number, ky: number} | number): Rect {
        const { kx, ky } = typeof(k) === "number" ? { kx: k, ky: k } : k
        this.x *= kx
        this.y *= ky
        this.width *= kx
        this.height *= ky
        return this
    }

    /**
     * Scales the rectangle by the given factor(s).
     *
     * @param k - The scaling factor(s). It can be either:
     *   - An object with `kx` and `ky` properties representing the scaling
     *     factors for the x and y axes respectively.
     *   - A single number to uniformly scale both axes.
     * @returns A new `Rect` instance scaled by the given factor(s).
     */
    public scale(k: {kx: number, ky: number} | number): Rect {
        return Rect.FromRect(this).mutScale(k)
    }
}
