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

    console.log(resources.getTilesets())
    console.log(resources.getTileCount("terrain"))
    console.log(resources.getTileCount("buildings"))

    const tile_size = resources.getTileSize("buildings")

    console.log(`buildings tile_size: ${tile_size.width}x${tile_size.height}`)
    tile_size.free()

    for (let i = 0; i < resources.getTilemapCount(); ++i) {
        const tilemap = resources.getTilemap(i)

        console.log(tilemap.getClass())
        console.log(tilemap.getTiles())

        tilemap.free()
    }
}

watch(size, resize)
onMounted(loadGameResources)
</script>

<template>
    <canvas class="block w-full h-full" ref="canvas"></canvas>
</template>
