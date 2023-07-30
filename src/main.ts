import {
    Color,
    Context,
    ContextBuilder,
    Events,
    Scene,
    type ISceneState,
} from "@nealrame/scene"

import "./style.css"

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

(async () => {
    const { Dune2Resources } = await import("@nealrame/dune2-rc")
    const res = await fetch("/dune2.rc")
    const buffer = await res.arrayBuffer()

    const resources = Dune2Resources.load(new Uint8Array(buffer))

    const imageData = resources.getSpriteFrame("Starport", 3, "ordos", 4)
    const image = await createImageBitmap(imageData)

    const context =
        (new ContextBuilder())
            .withSize(400, 400)
            .build("#canvas")

    const animation = new Animation(image)
    const scene = new Scene(context, animation)

    scene.start()
})()
