import {
    matches,
} from "lodash"

import {
    computed,
    onMounted,
    onUnmounted,
    ref,
    unref,
    watch,
} from "vue"

import type {
    TVector,
} from "@nealrame/maths"

import {
    useKeyboard,
} from "./useKeyboard"

export type TMouseGrabConfig = {
    move: (movement: TVector) => void,
}

export function useMouseGrab({
    move,
}: TMouseGrabConfig) {
    const {
        keyDown,
        keyUp,
    } = useKeyboard(matches({ code: "ControlLeft" }))

    const ctrlKeyDown = ref(false)
    const mouseButton = ref(false)

    const mouseGrabbing = computed(() => {
        return unref(ctrlKeyDown)
            && unref(mouseButton)
    })

    function onMouseDown(ev: MouseEvent) {
        if (ev.button == 0) {
            mouseButton.value = true
            return false
        }
    }

    function onMouseUp(ev: MouseEvent) {
        if (ev.button == 0) {
            mouseButton.value = false
            return false
        }
    }

    function onMouseMove(ev: MouseEvent) {
        if (unref(mouseGrabbing)) {
            move({
                x: ev.movementX,
                y: ev.movementY,
            })
        }
    }

    function on() {
        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mousedown", onMouseDown)
        window.addEventListener("mouseup", onMouseUp)
    }

    function off() {
        window.removeEventListener("mousemove", onMouseMove)
        window.removeEventListener("mousedown", onMouseDown)
        window.removeEventListener("mouseup", onMouseUp)
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
