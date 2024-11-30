<script lang="ts">
export default { name: "Map" }
</script>

<script setup lang="ts">
import {
    cond,
    constant,
    flow,
    matches,
    noop,
} from "lodash"

import {
    storeToRefs,
} from "pinia"

import {
    ref,
    unref,
    watch,
} from "vue"

import {
    type TDune2GameOptions,
    Dune2Game,
    Dune2GameGenerator,
} from "@nealrame/dune2"

import {
    Rect,
    Vector,
    clamp,
} from "@nealrame/maths"

import {
    useKeyboard,
    useMouseGrab,
    useMouseZoom,
    useResize,
} from "../../composables"

import {
    useDune2GameAssets,
} from "../../stores"

const gameConfig: TDune2GameOptions = {
    map: {
        size: {
            width: 24,
            height: 24
        },
        terrain: {
            scale: 24,
            details: 1,
            sandThreshold: 0.4,
            rockThreshold: 0.625,
            mountainsThreshold: 0.875
        },
        spice: {
            scale: 13,
            details: 6,
            threshold: 0.6,
            saturationThreshold: 0.66
        },
        seed: 8531309479095871
    },
    spawnZone: {}
}

const canvas = ref<HTMLCanvasElement | null>(null)

const { devicePixelSize: screenSize } = useResize(canvas)
const { keyDown } = useKeyboard(ev => {
    return ev.code == "ArrowLeft"
        || ev.code == "KeyA"
        || ev.code == "ArrowRight"
        || ev.code == "KeyD"
        || ev.code == "ArrowUp"
        || ev.code == "KeyW"
        || ev.code == "ArrowDown"
        || ev.code == "KeyS"
})

const {
    dune2GameAssets,
    loading,
} = storeToRefs(useDune2GameAssets())

const scale = ref(4)

const game = ref<Dune2Game | null>(null)

function scaleUp() {
    scale.value = clamp(1, 4, scale.value + 1)
}

function scaleDown() {
    scale.value = clamp(1, 4, scale.value - 1)
}

function updateViewportOrigin(v?: Vector) {
    if (game.value == null) return
    if (v == null) return

    const scene = game.value.scene
    const vpSize = scene.viewport.size

    if (scene.size.width > vpSize.width) {
        const vpOrigin = Vector.FromVector(scene.viewport.topLeft).mutAdd(v)

        vpOrigin.x = clamp(0, scene.size.width - vpSize.width, vpOrigin.x)
        vpOrigin.y = clamp(0, scene.size.height - vpSize.height, vpOrigin.y)

        scene.viewport = Rect.FromPointAndSize(vpOrigin, vpSize)
    }
}

function updateViewportSize() {
    if (game.value == null) return

    const scene = game.value.scene
    const vpOrigin = scene.viewport.topLeft
    const vpOldSize = scene.viewport.size
    const vpNewSize = {
        width: screenSize.value.width/scale.value,
        height: screenSize.value.height/scale.value,
    }

    if (vpNewSize.width > scene.size.width) {
        vpOrigin.x = (scene.size.width - vpNewSize.width)/2
    } else {
        vpOrigin.x += (vpOldSize.width - vpNewSize.width)/2
        vpOrigin.x = clamp(0, scene.size.width - vpNewSize.width, vpOrigin.x)
    }

    if (vpNewSize.height > scene.size.height) {
        vpOrigin.y = (scene.size.height - vpNewSize.height)/2
    } else {
        vpOrigin.y += (vpOldSize.height - vpNewSize.height)/2
        vpOrigin.y = clamp(0, scene.size.height - vpNewSize.height, vpOrigin.y)
    }

    scene.viewport = Rect.FromPointAndSize(vpOrigin, vpNewSize)
}

watch(keyDown, flow(
    cond([
        [matches({ code: "ArrowLeft"  }), constant(Vector.Left)],
        [matches({ code: "KeyA"       }), constant(Vector.Left)],
        [matches({ code: "ArrowRight" }), constant(Vector.Right)],
        [matches({ code: "KeyD"       }), constant(Vector.Right)],
        [matches({ code: "ArrowUp"    }), constant(Vector.Up)],
        [matches({ code: "KeyW"       }), constant(Vector.Up)],
        [matches({ code: "ArrowDown"  }), constant(Vector.Down)],
        [matches({ code: "KeyS"       }), constant(Vector.Down)],
    ]),
    v => v?.mul(game.value?.scene?.cellSize.width ?? 1),
    updateViewportOrigin,
))

watch(
    [canvas, dune2GameAssets],
    async ([canvas, assets]) => {
        if (canvas == null) return
        if (assets == null) return
        if (game.value == null) {
            const generator = new Dune2GameGenerator()

            game.value = await generator.generate(canvas, assets, gameConfig)

            updateViewportSize()
            game.value.start()
        }
    }
)

watch(screenSize, size => {
    const canvasEl = unref(canvas)

    if (canvasEl != null) {
        canvasEl.width = size.width
        canvasEl.height = size.height
        updateViewportSize()
    }
})

useMouseGrab({
    move: movement => {
        updateViewportOrigin(Vector.FromVector(movement).mul(-2/scale.value))
    }
})

useMouseZoom({
    zoomIn: scaleUp,
    zoomOut: scaleDown,
})
</script>

<template>
    <canvas
        class="block w-full h-full"
        ref="canvas"
        @contextmenu.prevent.stop="noop"
        @dragover.prevent.stop="noop"
        @drop.prevent.stop="noop"
    ></canvas>
    <div v-if="loading"
        class="absolute left-0 top-0 w-full h-full z-10"
    >Loading...</div>
</template>
