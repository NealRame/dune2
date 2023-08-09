<script lang="ts">
    import PromiseWorker from "promise-worker"

    import {
        onMount,
    } from "svelte"

    import {
        Dune2Resources,
    } from "@nealrame/dune2-rc"

    import {
        Color,
        Context,
        Scene,
        type ISceneState,
        type TNoise2DGeneratorOptions,
    } from "@nealrame/engine"

    import NoiseWorker from "../workers/noise?worker"

    class State implements ISceneState {
        private _fillColor = Color.transparent
        private _resize = false

        constructor(
            public imageData: ImageData | null = null
        ) { }

        public onResize() {
            this._resize = true
        }

        public onTick(context: Context) {
            if (this._resize) {
                this._resize = false
                context.size = {
                    width: window.innerWidth,
                    height: window.innerHeight,
                }
            }

            if (this.imageData != null) {
                context.painter.drawImage({ x: 0, y: 0, }, this.imageData)
            } else {
                context.painter
                .setFillColor(this._fillColor)
                .fillRect({
                    x: 0,
                    y: 0,
                    width: context.width,
                    height: context.height,
                })
            }
        }
    }

    export let resources: Dune2Resources

    let worker = new PromiseWorker(new NoiseWorker())
    let canvas!: HTMLCanvasElement

    let context: Context | null = null
    let state: State | null = null

    let noiseConfig: TNoise2DGeneratorOptions = {
        seed: Date.now(),
        amplitude: 1,
        frequency: 1,
        octaves: 4,
        persistence: 1/3,
        scale: 128,
    }

    function onNoiseConfigChange(event: Event) {
        if (context == null) return
        if (state == null) return

        const target = event.target as HTMLElement

        switch (target.dataset.role) {
        case "seed":
            noiseConfig.seed = Date.now()
            break
        case "amplitude":
            noiseConfig.amplitude = parseFloat((target as HTMLInputElement).value)
            break
        case "frequency":
            noiseConfig.frequency = parseFloat((target as HTMLInputElement).value)
            break
        case "octaves":
            noiseConfig.octaves = parseFloat((target as HTMLInputElement).value)
            break
        case "persistence":
            noiseConfig.persistence = parseFloat((target as HTMLInputElement).value)
            break
        case "scale":
            noiseConfig.scale = parseFloat((target as HTMLInputElement).value)
            break
        default: return
        }

        worker
            .postMessage({ size: context.size, noiseConfig })
            .then((imageData: ImageData) => {
                state.imageData = imageData
            })
    }

    onMount(() => {
        context = new Context({
            canvas,
            size: {
                width: window.innerWidth,
                height: window.innerHeight,
            },
        })

        const onResize = () => {
            state?.onResize()
        }

        let scene: Scene | null = null

        worker
            .postMessage({ size: context.size, noiseConfig })
            .then((imageData: ImageData) => {
                state = new State(imageData)
                scene = new Scene(context, state)
                scene.start()
            })

        window.addEventListener("resize", onResize)
        return () => {
            scene?.stop()
            window.removeEventListener("resize", onResize)
        }
    })
</script>

<canvas bind:this={canvas} />
<div id="noise-editor">
    <label for="noise-amplitude">Amplitude</label>
    <input
        id="noise-amplitude"
        type="number"
        data-role="amplitude"
        min="0" max="2" step=".1" value={noiseConfig.amplitude}
        on:change={ev => {
            onNoiseConfigChange(ev)
        }}
    />
    <label for="noise-frequency">Frequency</label>
    <input
        id="noise-frequency"
        type="number"
        data-role="frequency"
        min="1" max="10" step="0.1" value={noiseConfig.frequency}
        on:change={ev => {
            onNoiseConfigChange(ev)
        }}
    />
    <label for="noise-octaves">Octaves</label>
    <input
        id="noise-octaves"
        type="number"
        data-role="octaves"
        min="1" max="8" step="1" value={noiseConfig.octaves}
        on:change={ev => {
            onNoiseConfigChange(ev)
        }}
    />
    <label for="noise-persistence">Persistence</label>
    <input
        id="noise-persistence"
        type="range"
        data-role="persistence"
        min="0.001" max="1" step="0.001" value={noiseConfig.persistence}
        on:change={ev => {
            onNoiseConfigChange(ev)
        }}
    />
    <label for="noise-scale">Scale</label>
    <input
        id="noise-scale"
        type="range"
        data-role="scale"
        min="1" max="256" step="1" value={noiseConfig.scale}
        on:change={ev => {
            onNoiseConfigChange(ev)
        }}
    />
    <button data-role="seed" on:click={ev => {
        onNoiseConfigChange(ev)
    }}>Seed</button>
</div>

<style>
    canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    #noise-editor {
        background-color: rgba(0, 0, 0, 0.5);

        display: grid;
        grid-template-columns: min-content 1fr;
        align-items: start;
        gap: 1rem;

        position: absolute;
        bottom: 0;
        right: 0;

        padding: .5rem;
    }
</style>