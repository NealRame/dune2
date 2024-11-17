<script lang="ts">
export default { name: "MapGeneratorConfigJSON" }
</script>

<script setup lang="ts">
import {
    ref,
    watch,
} from "vue"

import {
    type TDune2MapGeneratorConfig,
    Dune2MapGeneratorConfigSchema,
} from "@nealrame/dune2"


const config = defineModel<TDune2MapGeneratorConfig>({ required: true })
const source = ref(JSON.stringify(config.value, null, "  "))

function copyToClipboard() {
    const text = JSON.stringify(config.value, null, "  ")
    navigator.clipboard.writeText(text)
}

watch(source, source => {
    try {
        const data = JSON.parse(source)

        config.value = Dune2MapGeneratorConfigSchema.parse(data)
    } catch(err) { }
})
</script>

<template>
    <div class="backdrop-blur-sm border bg-white/10 relative p-2">
        <button
            class="action-btn-inv absolute top-2 right-2"
            @click="copyToClipboard"
        ><i class="fa-solid fa-copy"></i></button>
        <textarea
            class="bg-transparent outline-none font-mono text-xs resize-none"
            cols="40"
            rows="24"
            v-model="source"
        ></textarea>
    </div>
</template>
