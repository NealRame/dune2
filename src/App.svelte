<script lang="ts">
    import {
        Dune2Resources,
    } from "@nealrame/dune2-rc"

    import Load from "./components/Load.svelte"
    import Game from "./components/Game.svelte"
    import Home from "./components/Home.svelte"

    import Dune2DataUrl from "./dune2.rc"

    let route: string = "/"
    let resources: Dune2Resources|null = null

    async function fetchDune2Resources() {
        const res = await fetch(Dune2DataUrl)
        const data = await res.arrayBuffer()
        const { Dune2Resources } = await import("@nealrame/dune2-rc")
        resources = Dune2Resources.load(new Uint8Array(data))
    }

    function router(evt: Event) {
        if (evt.type === "load") {
            window.location.assign("#/")
        } else if (evt.type === "hashchange") {
            route = window.location.hash.slice(1)
        }
    }
</script>

<svelte:window
    on:hashchange={router}
    on:load={router}
/>

{#await fetchDune2Resources()}
    <Load/>
{:then}
    {#if route === "/"}
        <Home/>
    {:else if route === "/game"}
        <Game resources={resources}/>
    {:else}
        <h1>404</h1>
    {/if}
{:catch error}
    <p>error: {error.message}</p>
{/await}
