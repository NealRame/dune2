<script lang="ts">
export default { name: "Home" }
</script>

<script setup lang="ts">

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
        <ul class="text-2xl">
            <li>
                <RouterLink
                    class="hover:text-red-600 transition-colors duration-300"
                    :to="{
                        name: 'game',
                    }"
                >New Game</RouterLink>
            </li>
        </ul>
    </div>
</template>
