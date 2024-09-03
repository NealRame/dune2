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
    Dune2Resources,
} from "@nealrame/dune2-rc"

import {
    useResize,
} from "../composables"

import Dune2ResourcesURL from "../dune2.rc"

import type {
    TSize,
} from "../types"

const canvas = ref<HTMLCanvasElement | null>(null)
const { devicePixelSize: size } = useResize(canvas)

function resize(size: TSize) {
    const canvasEl = unref(canvas)

    if (canvasEl != null) {
        canvasEl.width = size.width
        canvasEl.height = size.height
    }
}

async function loadGameResources() {
    const res = await fetch(Dune2ResourcesURL)
    const data = await res.arrayBuffer()
    const resources = Dune2Resources.load(new Uint8Array(data))



    for (const tilesetId of resources.getTilesets()) {
        const tileCount = resources.getTilesetTileCount(tilesetId)
        const tileSize = resources.getTilesetTileSize(tilesetId)

        const tilesetImageData = resources.getTilesetImageData(
            tilesetId,
            32
        )

        console.log(tilesetImageData)
        console.log(`${tilesetId} tileCount=${tileCount} tileSize=${tileSize.width}x${tileSize.height}`)
    }
}

watch(size, resize)
onMounted(loadGameResources)
</script>

<template>
    <canvas class="block w-full h-full" ref="canvas"></canvas>
</template>
