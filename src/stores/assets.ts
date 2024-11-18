import {
    ref,
} from "vue"

import {
    defineStore,
} from "pinia"

import {
    type TDune2GameData,
    loadDune2Assets,
} from "@nealrame/dune2"


export const useDune2GameAssets = defineStore("Dune2GameAssets", () => {
    const loading = ref(true)
    const error = ref<Error | null>(null)
    const dune2GameAssets = ref<TDune2GameData | null>(null)

    loadDune2Assets()
        .then(rc => {
            dune2GameAssets.value = rc
        })
        .catch(err => {
            error.value = err as Error
        })
        .finally(() => {
            loading.value = false
        })

    return {
        dune2GameAssets,
        error,
        loading,
    }
})
