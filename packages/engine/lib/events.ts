import {
    type TPoint,
    type TSize,
} from "./maths"

export const KeyUp = 1 as const
export const KeyDown = 2 as const

export const MouseButtonDown = 4 as const
export const MouseButtonUp = 8 as const
export const MouseMotion = 16 as const
export const MouseWheel = 32 as const
export const Resize = 64 as const

export const All = 0
    | KeyUp
    | KeyDown
    | MouseButtonDown
    | MouseButtonUp
    | MouseMotion
    | MouseWheel
    | Resize

export type TEventType = typeof KeyUp
    | typeof KeyDown
    | typeof MouseButtonDown
    | typeof MouseButtonUp
    | typeof MouseMotion
    | typeof MouseWheel
    | typeof Resize

export type TEventFilter = (eventType: TEventType) => boolean

export type TEvent = {
    type: TEventType
}

export type TKeyUpEvent = TEvent & {
    type: typeof KeyUp
    key: string
}
export function isKeyUpEvent(
    event: TEvent,
): event is TKeyUpEvent {
    return event.type === KeyUp
}

export type TKeyDownEvent = TEvent & {
    type: typeof KeyDown
    key: string
}
export function isKeyDownEvent(
    event: TEvent,
): event is TKeyDownEvent {
    return event.type === KeyDown
}

export type TMouseButtonDownEvent = TEvent & {
    type: typeof MouseButtonDown
}
export function isMouseButtonDownEvent(
    event: TEvent,
): event is TMouseButtonDownEvent {
    return event.type === MouseButtonDown
}

export type TMouseButtonUpEvent = TEvent & {
    type: typeof MouseButtonUp
}
export function isMouseButtonUpEvent(
    event: TEvent,
): event is TMouseButtonUpEvent {
    return event.type === MouseButtonUp
}

export type MouseMotionEvent = TEvent & {
    type: typeof MouseMotion
    position: TPoint
}
export function isMouseMotionEvent(
    event: TEvent,
): event is MouseMotionEvent {
    return event.type === MouseMotion
}

export type TMouseWheelEvent = TEvent & {
    type: typeof MouseWheel
    deltaX: number
    deltaY: number
}
export function isMouseWheelEvent(
    event: TEvent,
): event is TMouseWheelEvent {
    return event.type === MouseWheel
}

export type TResizeEvent = TEvent & {
    type: typeof Resize
    size: TSize
}
export function isResizeEvent(
    event: TEvent,
): event is TResizeEvent {
    return event.type === Resize
}
