import {
    padLeft,
} from "@nealrame/utils"

function toHex(
    v: number,
): string {
    return padLeft(v.toString(16), 2, "0")
}

export type TRGBAColor = {
    r: number
    g: number
    b: number
    a: number
}

export class Color implements TRGBAColor {
    private _channels: [number, number, number, number]

    public constructor(r: number, g: number, b: number, a = 255) {
        this._channels = [r, g, b, a]
    }

    public get r(): number {
        return this._channels[0]
    }

    public get red(): number {
        return this.r
    }

    public set r(value: number) {
        this._channels[0] = value
    }

    public set red(value: number) {
        this.r = value
    }

    public get g(): number {
        return this._channels[1]
    }

    public get green(): number {
        return this.g
    }

    public set g(value: number) {
        this._channels[1] = value
    }

    public set green(value: number) {
        this.g = value
    }

    public get b(): number {
        return this._channels[2]
    }

    public get blue(): number {
        return this.b
    }

    public set b(value: number) {
        this._channels[2] = value
    }

    public set blue(value: number) {
        this.b = value
    }

    public get a(): number {
        return this._channels[3]
    }
    
    public get alpha(): number {
        return this.a
    }

    public set a(value: number) {
        this._channels[3] = value
    }

    public set alpha(value: number) {
        this.a = value
    }

    public toHexString(): string {
        return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}${toHex(this.a)}`
    }

    public toRGBString(): string {
        return `rgb(${this.r}, ${this.g}, ${this.b})`
    }

    public toRGBAString(): string {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`
    }

    public toArray(): [number, number, number, number] {
        return [this.r, this.g, this.b, this.a]
    }

    public static fromColor({ r, g, b, a }: TRGBAColor): Color {
        return new Color(r, g, b, a)
    }

    public static get black() {
        return new Color(0, 0, 0, 255)
    }

    public static get white() {
        return new Color(255, 255, 255, 255)
    }

    public static get transparent() {
        return new Color(0, 0, 0, 0)
    }

    public static get red() {
        return new Color(255, 0, 0, 255)
    }

    public static get green() {
        return new Color(0, 255, 0, 255)
    }

    public static get blue() {
        return new Color(0, 0, 255, 255)
    }

    public static get cyan() {
        return new Color(0, 255, 255, 255)
    }

    public static get magenta() {
        return new Color(255, 0, 255, 255)
    }

    public static get yellow() {
        return new Color(0, 255, 255, 255)
    }
}
