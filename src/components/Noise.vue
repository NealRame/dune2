<script lang="ts">
export default { name: "Noise" }
</script>

<script setup lang="ts">
import {
    ref,
    reactive,
    unref,
    watch,
} from "vue"

import {
    type TSize,
    type TNoiseConfig,
    NoiseConfigDefault,
    createNoise2DGenerator,
    createRangeMapper,
    ENoiseFunction,
} from "@nealrame/maths"

import {
    useResize,
} from "../composables"

import {
    useDune2GameResources,
} from "../stores"


const store = useDune2GameResources()
const canvas = ref<HTMLCanvasElement | null>(null)

const noiseConfig = reactive<TNoiseConfig>({
    ...NoiseConfigDefault,
})

const noiseSize = reactive<TSize>({
    width: 512,
    height: 512,
})

const { devicePixelSize: size } = useResize(canvas)

function resize(size: TSize) {
    const canvasEl = unref(canvas)

    if (canvasEl != null) {
        canvasEl.width = size.width
        canvasEl.height = size.height
    }
}

function draw() {
    const canvasEl = unref(canvas)
    if (canvasEl == null) return

    const context = canvasEl.getContext("2d")
    if (context == null) return

    const imageData = new ImageData(noiseSize.width, noiseSize.height)
    const left_x = (unref(size).width - noiseSize.width)/2
    const top_y = (unref(size).height - noiseSize.height)/2

    const noise = createNoise2DGenerator(unref(noiseConfig))
    const map = createRangeMapper(-1, 1, 0, 255)

    context.clearRect(0, 0, size.value.width, size.value.height)

    for (let y = 0; y < noiseSize.height; ++y) {
        let offset = 4*y*noiseSize.width

        for (let x = 0; x < noiseSize.width; ++x) {
            const c = map(noise(x, y))

            imageData.data[offset++] = c
            imageData.data[offset++] = c
            imageData.data[offset++] = c
            imageData.data[offset++] = 255
        }
    }

    context.putImageData(imageData, left_x, top_y)
}

watch([noiseConfig, noiseSize], draw)
watch(size, resize)
</script>

<template>
    <canvas class="block w-full h-full" ref="canvas"></canvas>
    <div v-if="store.loading"
        class="absolute left-0 top-0 w-full h-full z-10"
    >Loading...</div>
    <div v-else
        class="border rounded absolute bottom-4 right-4 p-1 grid grid-cols-2 gap-1 items-center"
    >
        <label for="type">Type</label>
        <select id="title" class="text-black"
            v-model="noiseConfig.type"
        >
            <option :value="ENoiseFunction.None">None</option>
            <option :value="ENoiseFunction.Invert">Invert</option>
            <option :value="ENoiseFunction.Billowy">Billowy</option>
            <option :value="ENoiseFunction.Ridged">Ridged</option>
        </select>

        <label for="amplitude">Amplitude</label>
        <input id="amplitude" class="text-black"
            type="number" step="0.1"
            v-model="noiseConfig.amplitude"
        >

        <label for="octaves">Octaves</label>
        <input id="octaves" class="text-black"
            type="number" min="1" max="8" step="1"
            v-model="noiseConfig.octaves"
        >

        <label for="frequency">Frequency</label>
        <input id="frequency" class="text-black"
            type="number" step="0.1"
            v-model="noiseConfig.frequency"
        >

        <label for="persistence">Lacunarity</label>
        <input id="persistence" class="text-black"
            type="number" step=".01"
            v-model="noiseConfig.persistence"
        >

        <label for="scale">Scale</label>
        <input id="scale" class="text-black"
            type="number" min="1"
            v-model="noiseConfig.scale"
        >

        <button class="border rounded col-span-2"
            @click="noiseConfig.seed = Date.now()"
        >seed</button>

        <label for="width">Width</label>
        <input id="width" class="text-black"
            type="number" min="32" max="512"
            v-model="noiseSize.width"
        >

        <label for="height">Height</label>
        <input id="height" class="text-black"
            type="number" min="32" max="512"
            v-model="noiseSize.height"
        >
    </div>
</template>
