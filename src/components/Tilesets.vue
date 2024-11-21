<script lang="ts">
export default { name: "Game" }
</script>

<script setup lang="ts">

import {
    ref,
    unref,
    watch,
} from "vue"

import {
    type TSize,
} from "@nealrame/maths"

import {
    useResize,
} from "../composables"

import {
    useDune2GameAssets,
} from "../stores"


const canvas = ref<HTMLCanvasElement | null>(null)
const store = useDune2GameAssets()
const currentTileset = ref<string|null>(null)

const { devicePixelSize: size } = useResize(canvas)

function resize(size: TSize) {
    const canvasEl = unref(canvas)

    if (canvasEl != null) {
        canvasEl.width = size.width
        canvasEl.height = size.height
    }
}

async function selectTileset(tilesetId: string) {
    const context = unref(canvas)?.getContext("2d")
    const texture = store.dune2GameAssets?.textures[tilesetId]

    if (texture != null && context != null) {
        const { surface } = texture
        const {
            width: screenWidth,
            height: screenHeight,
        } = context.canvas

        const x = (screenWidth - surface.width)/2
        const y = (screenHeight - surface.height)/2

        context.clearRect(0, 0, screenWidth, screenHeight)
        context.fillStyle = "#f0f"
        context.fillRect(x, y, surface.width, surface.height)
        context.drawImage(surface, x, y)
    }

    currentTileset.value = tilesetId
}

watch(size, resize)
</script>

<template>
    <canvas class="block w-full h-full" ref="canvas"></canvas>
    <ul v-if="store.dune2GameAssets" class="absolute top-1 left-1">
        <li v-for="(_,tilesetId) in store.dune2GameAssets.textures"
            class="px-2"
            :class="currentTileset === tilesetId ? ['text-red-600', 'font-bold'] : []"
            :key="tilesetId"
        >
            <button
                @click="() => selectTileset(tilesetId)"
            >{{ tilesetId }}</button>
        </li>
    </ul>
</template>
