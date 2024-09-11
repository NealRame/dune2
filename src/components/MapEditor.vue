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
    useGameResources,
} from "../stores"


const store = useGameResources()
const canvas = ref<HTMLCanvasElement | null>(null)

const { devicePixelSize: size } = useResize(canvas)

function resize(size: TSize) {
    const canvasEl = unref(canvas)

    if (canvasEl != null) {
        canvasEl.width = size.width
        canvasEl.height = size.height
    }
}

watch(size, resize)
</script>

<template>
    <canvas class="block w-full h-full" ref="canvas"></canvas>
    <div v-if="store.loading"
        class="absolute left-0 top-0 w-full h-full z-10"
    >Loading...</div>
</template>
