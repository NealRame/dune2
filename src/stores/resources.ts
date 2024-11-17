import {
    ref,
} from "vue"

import {
    defineStore,
} from "pinia"

import {
    type TDune2GameResources,
    loadDune2Resources,
} from "@nealrame/dune2"


export const useDune2GameResources = defineStore("Dune2GameResources", () => {
    const loading = ref(true)
    const error = ref<Error | null>(null)
    const dune2GameResources = ref<TDune2GameResources | null>(null)

    loadDune2Resources()
        .then(rc => {
            dune2GameResources.value = rc
        })
        .catch(err => {
            error.value = err as Error
        })
        .finally(() => {
            loading.value = false
        })

    return {
        dune2GameResources,
        error,
        loading,
    }
})
