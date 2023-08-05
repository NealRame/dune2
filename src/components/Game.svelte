<script lang="ts">
    import {
        onMount,
    } from "svelte"

    import {
        Dune2Resources,
    } from "@nealrame/dune2-rc"

    import {
        Color,
        Context,
        Events,
        Scene,
        type ISceneState,
    } from "@nealrame/scene"


    class Animation implements ISceneState {
        private _fillColor = new Color(255, 0, 0)
        private _incr = 4
    
        constructor(
            private _spriteFrame: ImageBitmap
        ) {}
    
        onTick(context: Context) {
            const centerX = context.width/2
            const centerY = context.height/2
    
            for (const event of context.events()) {
                if (Events.isKeyUpEvent(event)) {
                    console.log(event.key)
                }
                if (Events.isMouseButtonDownEvent(event)) {
                    console.log("mouse down")
                }
                if (Events.isMouseButtonUpEvent(event)) {
                    console.log("mouse up")
                }
                if (Events.isMouseWheelEvent(event)) {
                    console.log(event.deltaX, event.deltaY)
                }
            }
    
            context.painter
                .setFillColor(this._fillColor)
                .fillRect({
                    x: centerX - this._spriteFrame.width/2 - 2,
                    y: centerY - this._spriteFrame.height/2 - 2,
                    width: this._spriteFrame.width + 4,
                    height: this._spriteFrame.height + 4,
                })
                .setFillColor(Color.black)
                .fillRect({
                    x: centerX - this._spriteFrame.width/2,
                    y: centerY - this._spriteFrame.height/2,
                    width: this._spriteFrame.width,
                    height: this._spriteFrame.height,
                })
                .drawImage({
                    x: centerX - this._spriteFrame.width/2,
                    y: centerY - this._spriteFrame.height/2,
                }, this._spriteFrame)
    
            if (this._incr > 0) {
                if (this._fillColor.g + this._incr >= 255) {
                    this._fillColor.g = 255
                    this._fillColor.b = 255
                    this._incr *= -1
                }
            } else {
                if (this._fillColor.g + this._incr <= 0) {
                    this._fillColor.g = 0
                    this._fillColor.b = 0
                    this._incr *= -1
                }
            }
    
            this._fillColor.g += this._incr
            this._fillColor.b += this._incr
        }
    }

    export let resources: Dune2Resources
    let canvas!: HTMLCanvasElement

    onMount(() => {
        let scene: Scene|null = null

        const imageData = resources.getSpriteFrame("Starport", 3, "ordos", 4)
        createImageBitmap(imageData).then(image => {
            scene = new Scene(new Context({
                canvas,
                size: {
                    width: 400,
                    height: 400,
                },
            }), new Animation(image))
            scene.start()
        })

        return () => scene?.stop()
    })
</script>

<canvas bind:this={canvas} />
