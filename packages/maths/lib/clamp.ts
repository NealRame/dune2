/**
 * Clamps a value between a minimum and maximum value.
 * @param min the minimum value
 * @param max the maximum value
 * @param val the value to clamp
 * @returns the clamped value
 */
export function clamp(
    min: number,
    max: number,
    val: number,
): number {
    return Math.max(min, Math.min(max, val))
}
