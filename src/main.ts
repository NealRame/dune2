import "./style.css"

(async () => {
    const { Dune2Resources } = await import("@nealrame/dune2-rc")
    const res = await fetch("/dune2.rc")
    const buffer = await res.arrayBuffer()

    const resources = Dune2Resources.load(new Uint8Array(buffer))
    // const imageData = resources.getTile("tiles_16x16", 350, "harkonnen", 4)
    // const imageData = resources.getTilemap(10, "harkonnen", 4)
    const imageData = resources.getSpriteFrame("Starport", 3, "ordos", 4)

    const image = await createImageBitmap(imageData)
    const canvas = document.querySelector("#canvas") as HTMLCanvasElement

    canvas.width = image.width
    canvas.height = image.height

    const ctx = canvas.getContext("2d")
    if (ctx !== null) {
        ctx.drawImage(image, 0, 0)
    }
})()
