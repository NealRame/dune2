<script lang="ts">
export default { name: "Map" }
</script>

<script setup lang="ts">
import {
    cond,
    constant,
    flow,
    matches,
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
    type TSize,
    clamp,
    Rect,
    Vector,
} from "@nealrame/maths"

import {
    IScene,
    Scene,
} from "@nealrame/scene"

import {
    useKeyboard,
    useMouseGrab,
    useMouseZoom,
    useResize,
} from "../composables"

import {
    Dune2Map,
    Dune2MapSizeConfigModel,
    Dune2MapSpiceConfigModel,
    Dune2MapTerrainConfigModel,
} from "../dune2"

import {
    useDune2GameResources,
} from "../stores"

import {
    ModelInspector,
} from "./ModelInspector"


const canvas = ref<HTMLCanvasElement | null>(null)

const { devicePixelSize: size } = useResize(canvas)
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
const scale = ref(1)

const dune2MapSizeConfig = new Dune2MapSizeConfigModel()
const dune2MapTerrainConfig = new Dune2MapTerrainConfigModel()
const dune2MapSpiceConfig = new Dune2MapSpiceConfigModel()

let seed = 0
let scene: IScene | null = null


function updateViewportOrigin(v?: Vector) {
    if (scene == null) return
    if (v == null) return

    const vpSize = scene.viewport.size

    if (scene.size.width > vpSize.width) {
        const vpOrigin = Vector.FromVector(scene.viewport.topLeft).mutAdd(v)

        vpOrigin.x = clamp(0, scene.size.width - vpSize.width, vpOrigin.x)
        vpOrigin.y = clamp(0, scene.size.height - vpSize.height, vpOrigin.y)

        scene.viewport = Rect.FromPointAndSize(vpOrigin, vpSize)
        scene.render()
    }
}

function updateViewportSize(screenSize: TSize) {
    if (scene == null) return

    const vpOrigin = scene.viewport.topLeft
    const vpSize = {
        width: screenSize.width/scale.value,
        height: screenSize.height/scale.value,
    }

    scene.viewport = Rect.FromPointAndSize(vpOrigin, vpSize)
    scene.render()
}

function scaleUp() {
    scale.value = clamp(1, 4, scale.value + 1)
    updateViewportSize(size.value)
}

function scaleDown() {
    scale.value = clamp(1, 4, scale.value - 1)
    updateViewportSize(size.value)
}

async function updateMapGeneratorSeed() {
    seed = Date.now()
    await updateMapGeneratorConfig()
}

async function updateMapGeneratorConfig() {
    if (dune2GameResources.value == null) return
    if (canvas.value == null) return

    const dune2MapConfig = {
        ...dune2MapSizeConfig,
        ...dune2MapTerrainConfig,
        ...dune2MapSpiceConfig,
        seed,
    }

    const [
        textureTileSize,
        textureImage,
    ] = dune2GameResources.value.textures["terrain"]

    scene = await Scene.create(textureTileSize, dune2MapSizeConfig, canvas.value)
    scene.viewport = Rect.FromPointAndSize(Vector.Zero, size.value)
    scene.addLayer("land", textureImage, textureTileSize)

    const layer = scene.getLayerByName("land")
    const dune2Map = Dune2Map.generate(dune2MapConfig)

    dune2Map.render(layer!)

    scene.render()
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
    v => v?.mul(scene?.cellSize.width ?? 1),
    updateViewportOrigin,
))
watch(
    [canvas, dune2GameResources],
    async ([canvas, dune2GameResources]) => {
        if (canvas == null) return
        if (dune2GameResources == null) return

        updateMapGeneratorConfig()
    }
)
watch(size, size => {
    const canvasEl = unref(canvas)
    if (canvasEl != null) {
        canvasEl.width = size.width
        canvasEl.height = size.height

        updateViewportSize(size)
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
        oncontextmenu="return false"
        ref="canvas"
    ></canvas>
    <div v-if="loading"
        class="absolute left-0 top-0 w-full h-full z-10"
    >Loading...</div>
    <div v-else
        class="absolute bottom-4 right-4 flex gap-1"
    >
        <div class="flex flex-col gap-1">
            <button
                class="border rounded w-8 h-8"
                @click="scaleUp"
            >+</button>
            <button
                class="border rounded w-8 h-8"
                @click="scaleDown"
            >-</button>
            <button
                class="border rounded w-8 h-8"
                :class="showSettings ? ['bg-white text-black'] : []"
                @click="showSettings = !showSettings"
            >?</button>
        </div>
        <div v-if="showSettings"
            class="border rounded flex flex-col gap-2 p-1 text-sm"
        >
            <section class="flex flex-col gap-2">
                <h1 class="bg-gray-100 text-center text-gray-500 uppercase"
                >Size</h1>
                <ModelInspector
                    :model="dune2MapSizeConfig"
                    @changed="updateMapGeneratorConfig"
                />
            </section>

            <section class="flex flex-col gap-2">
                <h1 class="bg-gray-100 text-center text-gray-500 uppercase"
                >Terrain</h1>
                <ModelInspector
                    :model="dune2MapTerrainConfig"
                    @changed="updateMapGeneratorConfig"
                />
            </section>

            <section class="flex flex-col gap-2">
                <h1 class="bg-gray-100 text-center text-gray-500 uppercase"
                >Spice</h1>
                <ModelInspector
                    :model="dune2MapSpiceConfig"
                    @changed="updateMapGeneratorConfig"
                />
            </section>

            <button
                class="border rounded col-span-2"
                @click="updateMapGeneratorSeed">
                Seed
            </button>
        </div>
    </div>
</template>
