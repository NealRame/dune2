import {
    type Ref,
    onMounted,
    onUnmounted,
    ref,
} from "vue"

import type {
    TVector,
} from "@nealrame/maths"


export type TUseMouseEventExtractor = (event: MouseEvent) => TVector | null

export function useMouse() {
    const mousePosition = ref<TVector>({ x: 0, y: 0 })
    const mouseMovement = ref<TVector>({ x: 0, y: 0 })
    const mouseButtonLeft = ref<boolean>(false)
    const mouseButtonRight = ref<boolean>(false)

    function onMouseDown(ev: MouseEvent) {
        if (ev.button == 0) {
            mouseButtonLeft.value = true
            return false
        }
        if (ev.button == 2) {
            mouseButtonRight.value = true
            return false
        }
    }

    function onMouseUp(ev: MouseEvent) {
        if (ev.button == 0) {
            mouseButtonLeft.value = false
            return false
        }
        if (ev.button == 2) {
            mouseButtonRight.value = false
            return false
        }
    }

    function onMouseMove(ev: MouseEvent) {
        if (ev.ctrlKey && mouseButtonLeft.value) {
            mouseMovement.value = {
                x: ev.movementX,
                y: ev.movementY,
            }
        } else {
            mousePosition.value = {
                x: ev.clientX,
                y: ev.clientY,
            }
        }

    }

    onMounted(() => {
        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mousedown", onMouseDown)
        window.addEventListener("mouseup", onMouseUp)
    })

    onUnmounted(() => {
        window.removeEventListener("mousemove", onMouseMove)
        window.removeEventListener("mousedown", onMouseDown)
        window.removeEventListener("mouseup", onMouseUp)
    })

    return {
        mouseButtonLeft,
        mouseButtonRight,
        mousePosition,
        mouseMovement,
    }
}
