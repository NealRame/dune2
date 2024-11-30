import {
    type TPoint,
    type TSize,
} from "@nealrame/maths"


export function posToIndex(
    { x, y }: TPoint,
    { width, height }: TSize,
): number | null {
    if (x >= 0 && x < width && y >= 0 && y < height) {
        return y*width + x
    } else {
        return null
    }
}
