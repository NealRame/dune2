import {
    matches,
} from "lodash"

import {
    onMounted,
    onUnmounted,
    ref,
    watch,
} from "vue"

import {
    useKeyboard,
} from "./useKeyboard"


export type TMouseZoomConfig = {
    zoomIn: () => void,
    zoomOut: () => void,
}

export function useMouseZoom({
    zoomIn,
    zoomOut,
}: TMouseZoomConfig) {
    const ctrlKeyDown = ref(false)
    const {
        keyDown,
        keyUp,
    } = useKeyboard(matches({ code: "ControlLeft" }))

    function onMouseWheel({ deltaY }: WheelEvent) {
        if (ctrlKeyDown.value) {
            if (deltaY > 0) {
                zoomIn()
            } else {
                zoomOut()
            }
        }
    }

    function on() {
        window.addEventListener("wheel", onMouseWheel)
    }

    function off() {
        window.removeEventListener("wheel", onMouseWheel)
    }

    watch(keyDown, () => ctrlKeyDown.value = true)
    watch(keyUp, () => ctrlKeyDown.value = false)

    onMounted(on)
    onUnmounted(off)

    return {
        on,
        off,
    }
}
