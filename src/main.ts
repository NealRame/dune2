import {
    Painter,
    Color,
} from "@nealrame/scene"

import {
    Dune2Resources,
} from "@nealrame/dune2-rc"

import "./style.css"

async function createAnimation(
    painter: Painter,
    resources: Dune2Resources,
) {
    // const imageData = resources.getTile("tiles_16x16", 350, "harkonnen", 4)
    // const imageData = resources.getTilemap(10, "harkonnen", 4)
    const imageData = resources.getSpriteFrame("Starport", 3, "ordos", 4)
    const image = await createImageBitmap(imageData)

    const fillColor = {
        r: 255,
        g: 0,
        b: 0,
        a: 255,
    }

    let animationFrameId = 0

    let incr = 4

    const frame = () => {
        painter
            .setFillColor(fillColor)
            .fillRect({
                x: 400 - image.width/2 - 2,
                y: 400 - image.height/2 - 2,
                width: image.width + 4,
                height: image.height + 4,
            })
            .setFillColor(Color.Black)
            .fillRect({
                x: 400 - image.width/2,
                y: 400 - image.height/2,
                width: image.width,
                height: image.height,
            })
            .drawImage({
                x: 400 - image.width/2,
                y: 400 - image.height/2,
            }, image)

        if (incr > 0) {
            if (fillColor.g + incr >= 255) {
                fillColor.g = 255
                fillColor.b = 255
                incr *= -1
            }
        } else {
            if (fillColor.g + incr <= 0) {
                fillColor.g = 0
                fillColor.b = 0
                incr *= -1
            }
        }

        fillColor.g += incr
        fillColor.b += incr

        animationFrameId = window.requestAnimationFrame(frame)
    }

    return {
        start() {
            window.requestAnimationFrame(frame)
        },
        stop() {
            window.cancelAnimationFrame(animationFrameId)
        }
    }
}

(async () => {
    const { Dune2Resources } = await import("@nealrame/dune2-rc")
    const res = await fetch("/dune2.rc")
    const buffer = await res.arrayBuffer()

    const resources = Dune2Resources.load(new Uint8Array(buffer))
    const canvas = document.querySelector("#canvas") as HTMLCanvasElement

    canvas.width = 600
    canvas.height = 600

    const animation = await createAnimation(
        new Painter(canvas.getContext("2d") as CanvasRenderingContext2D),
        resources
    )
    animation.start()
})()
