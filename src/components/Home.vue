<script lang="ts">
export default { name: "Home" }
</script>

<script setup lang="ts">
import {
    storeToRefs,
} from "pinia"

import {
    useDune2GameResources,
} from "../stores"

const { loading, error } = storeToRefs(useDune2GameResources())

const menuStyle = [
    "flex",
    "flex-col",
    "gap-8",
    "text-center",
    "absolute",
    "left-1/2",
    "top-1/2",
    "translate-x-[-50%]",
    "translate-y-[-50%]",
]
</script>

<template>
    <div :class="menuStyle">
        <header>
            <h1 class="border-b border-red-600 font-dune text-red-600 text-center text-8xl">Dune</h1>
            <h2 class="font-thin text-red-600 text-center text-4xl">The Battle for Arrakis</h2>
        </header>
        <div class="text-2xl">
            <div v-if="loading">Loading...</div>
            <div v-else-if="error">Something went wrong :-/</div>
            <ul v-else>
                <li>
                    <RouterLink
                        class="hover:text-red-600 transition-colors duration-300"
                        :to="{
                            name: 'map-editor',
                        }"
                    >Map Editor</RouterLink>
                </li><li>
                    <RouterLink
                        class="hover:text-red-600 transition-colors duration-300"
                        :to="{
                            name: 'tilesets',
                        }"
                    >Tilesets</RouterLink>
                </li><li>
                    <RouterLink
                        class="hover:text-red-600 transition-colors duration-300"
                        :to="{
                            name: 'noise-editor',
                        }"
                    >Noise Editor</RouterLink>
                </li>
            </ul>
        </div>
    </div>
</template>
