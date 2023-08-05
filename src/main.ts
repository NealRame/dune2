import {
    Color,
    Context,
    Events,
    Scene,
    type ISceneState,
} from "@nealrame/scene"

import "./style.css"

import Dune2DataUrl from "./dune2.rc"

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

async function fetchDune2Resources() {
    const res = await fetch(Dune2DataUrl)
    const data = await res.arrayBuffer()
    const { Dune2Resources } = await import("@nealrame/dune2-rc")
    return Dune2Resources.load(new Uint8Array(data))
}

;(async () => {
    const dune2Resources = await fetchDune2Resources()

    const imageData = dune2Resources.getSpriteFrame("Starport", 3, "ordos", 4)
    const image = await createImageBitmap(imageData)

    const context = new Context({
        canvas: "#canvas",
        size: {
            width: 400,
            height: 400,
        },
    })

    const animation = new Animation(image)
    const scene = new Scene(context, animation)

    scene.start()
})()
