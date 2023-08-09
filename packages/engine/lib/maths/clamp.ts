/**
 * Clamps a value between a minimum and maximum value.
 * @param min the minimum value
 * @param max the maximum value
 * @param value the value to clamp
 * @returns the clamped value
 */
export function clamp(min, max, value) {
    return Math.max(min, Math.min(max, value))
}
