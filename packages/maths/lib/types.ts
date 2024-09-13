export type TPoint = {
    x: number
    y: number
}

export type TSize = {
    width: number
    height: number
}

export type TRect = TPoint & TSize

export type TNoise2DGenerator = (x: number, y: number) => number
