import {
    type TColor,
} from "./types"

function padLeft(
    str: string,
    targetLength: number,
    padString: string
): string {
    while (str.length < targetLength) {
        str = padString + str
    }
    return str.slice(-targetLength)
}

function toHex(
    v: number,
): string {
    return padLeft(v.toString(16), 2, "0")
}

export const Black: TColor = {
    r: 0,
    g: 0,
    b: 0,
    a: 255,
}

export const White: TColor = {
    r: 255,
    g: 255,
    b: 255,
    a: 255,
}

export function cssHex(
    color: TColor
): string {
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}${toHex(color.a)}`
}

export function cssRGB(
    color: TColor
): string {
    return `rgb(${color.r}, ${color.g}, ${color.b})`
}

export function cssRGBA(
    color: TColor
): string {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
}
