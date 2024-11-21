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
    computed,
    ref,
    unref,
    watch,
} from "vue"

import {
    type TDune2MapGeneratorConfig,
    Dune2Map,
    Dune2MapGeneratorConfigSchema,
} from "@nealrame/dune2"

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
    useDune2GameAssets,
} from "../../stores"

import {
    Dune2MapSizeConfigModel,
    Dune2MapSpiceConfigModel,
    Dune2MapTerrainConfigModel,
} from "./models"

import ConfigInspector from "./ConfigInspector.vue"
import ConfigJSON from "./ConfigJSON.vue"


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

const showSettings = ref(true)
const showSettingsMode = ref<"form" | "json">("form")

const view = computed(() => {
    switch (unref(showSettingsMode)) {
    case "form": return ConfigInspector
    case "json": return ConfigJSON
    }
})

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
    if (dune2GameAssets.value == null) return
    if (canvas.value == null) return

    const dune2MapConfig = dune2MapGeneratorConfig.value

    const texture = dune2GameAssets.value.textures["terrain"]

    scene = await Scene.create(
        {...texture.tileSize},
        dune2MapConfig.size,
        canvas.value,
    )

    const layer = scene.addLayer(SceneTilemapLayer, {
        name: "land",
        texture,
    })

    const dune2Map = await Dune2Map.create(dune2MapConfig)

    dune2Map.render(layer!)
    updateViewportSize()
}

function scaleUp() {
    scale.value = clamp(1, 4, scale.value + 1)
}

function scaleDown() {
    scale.value = clamp(1, 4, scale.value - 1)
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
    [canvas, dune2GameAssets],
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
            class="border rounded flex-auto flex flex-col gap-1 p-1 text-sm"
        >
            <section class="relative bg-white rounded-t-sm text-black p-1">
                <h1 class="grow uppercase text-lg text-center">Map Generator</h1>
            </section>

            <component :is="view" v-model="dune2MapGeneratorConfig"/>

            <section class="relative bg-white rounded-b-sm text-black p-1 flex gap-1">
                <button
                    :class="showSettingsMode === 'form' ? 'action-btn-active' : 'action-btn'"
                    @click="showSettingsMode = 'form'"
                ><i class="fa-solid fa-sliders"></i></button>
                <button
                    :class="showSettingsMode === 'json' ? 'action-btn-active' : 'action-btn'"
                    @click="showSettingsMode = 'json'"
                ><i class="fa-solid fa-code"></i></button>
            </section>
        </div>
        <div class="flex flex-col-reverse gap-1">
            <button
                class="action-btn-inv"
                @click="scaleUp"
            ><i class="fa-solid fa-magnifying-glass-plus"></i></button>
            <button
                class="action-btn-inv"
                @click="scaleDown"
            ><i class="fa-solid fa-magnifying-glass-minus"></i></button>
            <button
                class="action-btn-inv"
                :class="showSettings ? 'action-btn-inv-active' : 'action-btn-inv'"
                @click="showSettings = !showSettings"
            ><i class="fa-solid fa-gear"></i></button>
        </div>
    </div>
</template>
