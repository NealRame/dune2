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
    type TPoint,
    type TSize,
    Rect,
    Vector,
    clamp,
} from "@nealrame/maths"

import {
    type IScene,
    Scene,
    SceneTilemapLayer,
} from "@nealrame/scene"

import {
    useKeyboard,
    useMouseGrab,
    useMouseZoom,
    useResize,
} from "../../composables"

import {
    type TDune2MapGeneratorConfig,
    Dune2Map,
    Dune2MapSizeConfigModel,
    Dune2MapSpiceConfigModel,
    Dune2MapTerrainConfigModel,
    Dune2MapGeneratorConfigSchema,
} from "../../dune2"

import {
    useDune2GameResources,
} from "../../stores"

import Inspector from "./Inspector.vue"

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
    dune2GameResources,
    loading,
} = storeToRefs(useDune2GameResources())

const showSettings = ref(true)
const scale = ref(4)

const dune2MapGeneratorConfig = ref<TDune2MapGeneratorConfig>({
    size: Dune2MapSizeConfigModel.default,
    terrain: Dune2MapTerrainConfigModel.default,
    spice: Dune2MapSpiceConfigModel.default,
    seed: 0,
})

let scene: IScene | null = null
let sceneViewportOrigin: TPoint | null = null
let sceneViewportSize: TSize | null = null

function updateViewportOrigin(v?: Vector) {
    if (scene == null) return
    if (v == null) return

    const vpSize = scene.viewport.size

    if (scene.size.width > vpSize.width) {
        const vpOrigin = Vector.FromVector(scene.viewport.topLeft).mutAdd(v)

        vpOrigin.x = clamp(0, scene.size.width - vpSize.width, vpOrigin.x)
        vpOrigin.y = clamp(0, scene.size.height - vpSize.height, vpOrigin.y)

        sceneViewportOrigin = vpOrigin

        scene.viewport = Rect.FromPointAndSize(vpOrigin, vpSize)
        scene.render()
    }
}

function updateViewportSize() {
    if (scene == null) return

    const vpOrigin = sceneViewportOrigin ?? scene.viewport.topLeft

    const vpOldSize = sceneViewportSize ?? scene.viewport.size
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

    sceneViewportOrigin = vpOrigin
    sceneViewportSize = vpNewSize

    scene.viewport = Rect.FromPointAndSize(vpOrigin, vpNewSize)
    scene.render()
}

async function updateScene() {
    if (dune2GameResources.value == null) return
    if (canvas.value == null) return

    const dune2MapConfig = dune2MapGeneratorConfig.value

    const [
        textureTileSize,
        textureImage,
    ] = dune2GameResources.value.textures["terrain"]

    scene = await Scene.create(
        {...textureTileSize},
        dune2MapConfig.size,
        canvas.value,
    )

    const layer = scene.addLayer(SceneTilemapLayer, {
        name: "land",
        textureImage,
        textureTileSize,
    })

    const dune2Map = Dune2Map.generate(dune2MapConfig)

    dune2Map.render(layer!)
    updateViewportSize()
}

function scaleUp() {
    scale.value = clamp(1, 4, scale.value + 1)
}

function scaleDown() {
    scale.value = clamp(1, 4, scale.value - 1)
}

function copyToClipboard() {
    const text = JSON.stringify(dune2MapGeneratorConfig.value, null, "  ")
    navigator.clipboard.writeText(text)
}

async function drop(event: DragEvent) {
    const file = event.dataTransfer?.files?.[0]

    if (file != null) {
        const content = await file.text()

        try {
            const config = Dune2MapGeneratorConfigSchema.parse(JSON.parse(content))

            dune2MapGeneratorConfig.value = config
        } catch (err) {
            console.error(err)
        }
    }
}

watch(dune2MapGeneratorConfig, updateScene)

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
    v => v?.mul(scene?.cellSize.width ?? 1),
    updateViewportOrigin,
))

watch(
    [canvas, dune2GameResources],
    async ([canvas, dune2GameResources]) => {
        if (canvas == null) return
        if (dune2GameResources == null) return

        updateScene()
    }
)

watch(scale, updateViewportSize)

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
        @contextmenu.prevent.stop="noop"
        @dragover.prevent.stop="noop"
        @drop.prevent.stop="drop"
        ref="canvas"
    ></canvas>
    <div v-if="loading"
        class="absolute left-0 top-0 w-full h-full z-10"
    >Loading...</div>
    <div v-else
        class="absolute bottom-4 right-4 flex gap-1"
    >
        <div v-if="showSettings"
            class="border rounded flex flex-col gap-2 p-1 text-sm"
        >
            <section class="relative bg-white rounded-t-sm text-black p-1">
                <h1 class="grow uppercase text-lg text-center">Map Generator</h1>
                <button
                    class="absolute top-1/2 right-1 -translate-y-1/2 hover:text-gray-700 active:text-gray-400"
                    @click="copyToClipboard"
                ><i class="fa-solid fa-copy"></i></button>
            </section>

            <Inspector v-model="dune2MapGeneratorConfig"/>
        </div>
        <div class="flex flex-col-reverse gap-1">
            <button
                class="border rounded w-8 h-8"
                @click="scaleUp"
            ><i class="fa-solid fa-magnifying-glass-plus"></i></button>
            <button
                class="border rounded w-8 h-8"
                @click="scaleDown"
            ><i class="fa-solid fa-magnifying-glass-minus"></i></button>
            <button
                class="border rounded w-8 h-8"
                :class="showSettings ? ['bg-white text-black'] : []"
                @click="showSettings = !showSettings"
            ><i class="fa-solid fa-gear"></i></button>
        </div>
    </div>
</template>
