import type {
    TSize,
    TVector,
} from "./types"


export class Size implements TSize {
    /**
     * Creates a new `Rect` instance from the given `TRect` object.
     *
     * @param rect - A `TRect` like object.
     * @returns A new `Rect`.
     */
    public static FromSize({ width, height }: TSize): Size {
        return new Size(width, height)
    }

    /**
     * A size with both width and height components set to zero.
     *
     * @returns A vector with coordinates (0, 0).
     */
    public static get Zero(): Size {
        return new Size(0, 0)
    }

    /**
     * Creates an instance of a size with specified width and height.
     * 
     * @param width - The width.
     * @param height - The height.
     */
    public constructor(
        /**
         * The width.
         */
        public width: number,
        /**
         * The height.
         */
        public height: number,
    ) { }

    /**
     * Returns the size as an array of two numbers.
     */
    public get asArray(): [number, number] {
        return [this.width, this.height]
    }
}
