<script lang="ts">
export default { name: "Game" }
</script>

<script setup lang="ts">

import {
    onMounted,
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
    type TGameResources,
    loadDune2Resources,
} from "../dune2"


const canvas = ref<HTMLCanvasElement | null>(null)
const gameResources = ref<TGameResources | null>(null)

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
    const texture = gameResources.value?.textures[tilesetId]

    if (texture != null && context != null) {
        const [_, image] = texture
        const {
            width: screenWidth,
            height: screenHeight,
        } = context.canvas

        context.clearRect(0, 0, screenWidth, screenHeight)
        context.drawImage(
            image,
            (screenWidth - image.width)/2,
            (screenHeight - image.height)/2
        )
    }
}

watch(size, resize)
onMounted(async () => {
    gameResources.value = await loadDune2Resources()
})
</script>

<template>
    <canvas class="block w-full h-full" ref="canvas"></canvas>
    <ul v-if="gameResources" class="absolute top-1 left-1">
        <li v-for="(_,tilesetId) in gameResources.textures" :key="tilesetId">
            <button
                @click="() => selectTileset(tilesetId)"
            >{{ tilesetId }}</button>
        </li>
    </ul>
</template>
