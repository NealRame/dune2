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
    reactive,
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
    Dune2MapGeneratorConfigDefault,
} from "../dune2"

import {
    useDune2GameResources,
} from "../stores"


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

const dune2MapSize = reactive<TSize>({
    width: 64,
    height: 64,
})
const dune2MapConfig = reactive({
    ...Dune2MapGeneratorConfigDefault,
})

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
    [canvas, dune2GameResources, dune2MapConfig, dune2MapSize],
    async ([canvas, gameResources, dune2MapConfig, dune2MapSize]) => {
        if (canvas == null) return
        if (gameResources == null) return

        const config = {
            ...dune2MapConfig,
            size: { ...dune2MapSize },
        }

        const [
            textureTileSize,
            textureImage,
        ] = gameResources.textures["terrain"]

        scene = await Scene.create(textureTileSize, config.size, canvas)
        scene.viewport = Rect.FromPointAndSize(Vector.Zero, size.value)
        scene.addLayer("land", textureImage, textureTileSize)

        const layer = scene.getLayerByName("land")
        const dune2Map = Dune2Map.generate(config)

        dune2Map.render(layer!)

        scene.render()
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
            <section>
                <h1 class="bg-gray-100 text-center text-gray-500 uppercase">Size</h1>
                <div class="grid grid-cols-[1fr_auto_min-content] gap-1 p-1">
                    <label
                        class="text-right"
                        for="map_w"
                    >Width</label>
                    <input
                        id="map_w"
                        class="px-1 text-black"
                        type="range"
                        min="4"
                        max="256"
                        step="1"
                        v-model.number="dune2MapSize.width">
                    <span>{{ dune2MapSize.width }}</span>
                    <label
                        class="text-right"
                        for="map_h"
                    >Height</label>
                    <input
                        id="map_h"
                        class="px-1 text-black"
                        type="range"
                        min="4"
                        max="256"
                        step="1"
                        v-model.number="dune2MapSize.height">
                    <span>{{ dune2MapSize.height }}</span>
                </div>
            </section>

            <section>
                <h1 class="bg-gray-100 text-center text-gray-500 uppercase">Terrain</h1>
                <div class="grid grid-cols-[1fr_auto] gap-1 p-1">
                    <label
                        class="text-right"
                        for="terrain_scale"
                    >Scale</label>
                    <input
                        id="terrain_scale"
                        class="px-1 text-black"
                        type="range"
                        min="1"
                        max="256"
                        step="1"
                        v-model.number="dune2MapConfig.terrainScale">

                    <label
                        class="text-right"
                        for="terrain_details"
                    >Details</label>
                    <input
                        id="terrain_details"
                        class="px-1 text-black"
                        type="range"
                        min="1"
                        max="8"
                        step="1"
                        v-model.number="dune2MapConfig.terrainDetails">

                    <label
                        class="text-right"
                        for="terrain_sand_threshold"
                    >Sand Threshold</label>
                    <input
                        id="terrain_sand_threshold"
                        class="px-1 text-black"
                        type="range"
                        min="0"
                        max="1"
                        step="0.001"
                        v-model.number="dune2MapConfig.terrainSandThreshold">

                    <label
                        class="text-right"
                        for="terrain_rock_threshold"
                    >Rock Threshold</label>
                    <input
                        id="terrain_rock_threshold"
                        class="px-1 text-black"
                        type="range"
                        min="0"
                        max="1"
                        step="0.001"
                        v-model.number="dune2MapConfig.terrainRockThreshold">

                    <label
                        class="text-right"
                        for="terrain_mountains_threshold"
                    >Mountains Threshold</label>
                    <input
                        id="terrain_mountains_threshold"
                        class="px-1 text-black"
                        type="range"
                        min="0"
                        max="1"
                        step="0.001"
                        v-model.number="dune2MapConfig.terrainMountainsThreshold">
                </div>
            </section>

            <section>
                <h1 class="bg-gray-100 text-center text-gray-500 uppercase">Spice</h1>
                <div class="grid grid-cols-[1fr_auto] gap-1 p-1">
                    <label
                        class="text-right"
                        for="spice_scale"
                    >Scale</label>
                    <input
                        id="spice_scale"
                        class="px-1 text-black"
                        type="range"
                        min="1"
                        max="256"
                        step="1"
                        v-model.number="dune2MapConfig.spiceScale">

                    <label
                        class="text-right"
                        for="spice_details"
                    >Details</label>
                    <input
                        id="spice_details"
                        class="px-1 text-black"
                        type="range"
                        min="1"
                        max="8"
                        step="1"
                        v-model.number="dune2MapConfig.spiceDetails">

                    <label
                        class="text-right"
                        for="spice_threshold"
                    >Threshold</label>
                    <input
                        id="spice_threshold"
                        class="px-1 text-black"
                        type="range"
                        min="0"
                        max="1"
                        step="0.001"
                        v-model.number="dune2MapConfig.spiceThreshold">

                    <label
                        class="text-right"
                        for="spice_saturation_threshold"
                    >Saturation Threshold</label>
                    <input
                        id="spice_saturation_threshold"
                        class="px-1 text-black"
                        type="range"
                        min="0"
                        max="1"
                        step="0.001"
                        v-model.number="dune2MapConfig.spiceSaturationThreshold">
                </div>
            </section>
            <button
                class="border rounded col-span-2"
                @click="dune2MapConfig.seed = Date.now()">
                Seed
            </button>
        </div>
    </div>
</template>
