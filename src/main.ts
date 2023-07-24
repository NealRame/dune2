import {
    Color,
    Context,
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
        if (context.key != null) {
            console.log(context.key)
        }
        context.painter
            .setFillColor(this._fillColor)
            .fillRect({
                x: 400 - this._spriteFrame.width/2 - 2,
                y: 400 - this._spriteFrame.height/2 - 2,
                width: this._spriteFrame.width + 4,
                height: this._spriteFrame.height + 4,
            })
            .setFillColor(Color.black)
            .fillRect({
                x: 400 - this._spriteFrame.width/2,
                y: 400 - this._spriteFrame.height/2,
                width: this._spriteFrame.width,
                height: this._spriteFrame.height,
            })
            .drawImage({
                x: 400 - this._spriteFrame.width/2,
                y: 400 - this._spriteFrame.height/2,
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

    const context = new Context(
        document.querySelector("#canvas") as HTMLCanvasElement,
        {
            width: 600,
            height: 600,
        }
    )
    const animation = new Animation(image)
    const scene = new Scene(context, animation)

    scene.start()
})()
