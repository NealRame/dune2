/**
 * Pad a given string on left
 * @param str the string to be padded
 * @param targetLength the target length
 * @param padString the pad string
 * @returns a new string whose size equals the target length
 * @example
 * ```ts
 * const s = "1"
 * const padded1 = leftPad(s, 3, "0")  # padded1 = "001"
 * const padded2 = leftPad(s, 4, "00") # padded2 = "0001"
 * ```
 */
export function padLeft(
    str: string,
    targetLength: number,
    padString: string
): string {
    if (targetLength <= str.length) {
        return str.slice(0)
    }
    while (str.length < targetLength) {
        str = padString + str
    }
    return str.slice(-targetLength)
}
