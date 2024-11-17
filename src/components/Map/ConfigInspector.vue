<script lang="ts">
export default { name: "MapGeneratorConfigInspector" }
</script>

<script setup lang="ts">
import {
    ref,
    watch,
} from "vue"

import {
    type TDune2MapGeneratorConfig,
    Dune2MapSizeConfigModel,
    Dune2MapSpiceConfigModel,
    Dune2MapTerrainConfigModel,
} from "@nealrame/dune2"

import {
    ModelInspector,
} from "../ModelInspector"


const config = defineModel<TDune2MapGeneratorConfig>({ required: true })

const size = ref(Dune2MapSizeConfigModel.from(config.value.size))
const terrain = ref(Dune2MapTerrainConfigModel.from(config.value.terrain))
const spice = ref(Dune2MapSpiceConfigModel.from(config.value.spice))
const seed = ref(config?.value?.seed ?? 0)

function randSeed() {
    seed.value = Math.floor(Math.random()*Number.MAX_SAFE_INTEGER)
}

watch([size, terrain, spice, seed], ([size, terrain, spice, seed]) => {
    config.value = {
        size,
        terrain,
        spice,
        seed,
    }
})
</script>

<template>
    <div class="backdrop-blur-sm bg-white/10 border flex flex-col gap-2 p-1">
        <section class="flex flex-col gap-2">
            <h1 class="bg-gray-100 text-center text-gray-500 uppercase"
            >Size</h1>
            <ModelInspector v-model="size"/>
        </section>
        
        <section class="flex flex-col gap-2">
            <h1 class="bg-gray-100 text-center text-gray-500 uppercase"
            >Terrain</h1>
            <ModelInspector v-model="terrain"/>
        </section>
        
        <section class="flex flex-col gap-2">
            <h1 class="bg-gray-100 text-center text-gray-500 uppercase"
            >Spice</h1>
            <ModelInspector v-model="spice"/>
        </section>
        
        <section class="flex flex-col gap-2">
            <h1 class="bg-gray-100 text-center text-gray-500 uppercase"
            >Seed</h1>
            <div class="flex gap-1">
                <label for="seed-value">value</label>
                <input
                    class="grow outline-none px-1 rounded text-black text-center"
                    id="seed-value"
                    type="number"
                    v-model="seed">
                <button
                    class="border rounded col-span-2 px-2"
                    @click="randSeed">
                    <i class="fa-solid fa-shuffle"></i>
                </button>
            </div>
        </section>
    </div>
</template>