import {
    onMounted,
    onUnmounted,
    ref,
} from "vue"

export type KeyboardEventFilter = (ev: KeyboardEvent) => boolean

export function useKeyboard(eventFilter?: KeyboardEventFilter) {
    const keyDown = ref<KeyboardEvent | null>(null)
    const keyUp = ref<KeyboardEvent | null>(null)

    const keyRepeat = ref(0)

    function onKeyDown(ev: KeyboardEvent) {
        if (eventFilter == null || eventFilter(ev)) {
            keyDown.value = ev
            keyRepeat.value = keyRepeat.value + 1
        }
    }

    function onKeyUp(ev: KeyboardEvent) {
        if (eventFilter == null || eventFilter(ev)) {
            keyUp.value = ev
            keyRepeat.value = 0
        }
    }

    onMounted(() => {
        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)
    })
    
    onUnmounted(() => {
        window.removeEventListener("keydown", onKeyDown)
        window.removeEventListener("keyup", onKeyUp)
    })

    return {
        keyDown,
        keyRepeat,
        keyUp,
    }
}
