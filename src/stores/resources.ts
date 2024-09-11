import {
    ref,
} from "vue"

import {
    defineStore,
} from "pinia"

import {
    type TGameResources,
    loadDune2Resources,
} from "../dune2"


export const useGameResources = defineStore("GameResources", () => {
    const loading = ref(true)
    const error = ref<Error | null>(null)
    const gameResources = ref<TGameResources | null>(null)

    loadDune2Resources()
        .then(rc => {
            gameResources.value = rc
        })
        .catch(err => {
            error.value = err as Error
        })
        .finally(() => {
            loading.value = false
        })

    return {
        gameResources,
        error,
        loading,
    }
})
