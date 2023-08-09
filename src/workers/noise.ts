import registerPromiseWorker from "promise-worker/register"

import {
    createNoise2DGenerator,
    createRangeMapper,
    type TNoise2DGeneratorOptions,
    type TSize,
} from "@nealrame/engine"

function noise(
    size: TSize,
    noiseConfig: TNoise2DGeneratorOptions,
): ImageData {
    const imageData = new ImageData(size.width, size.height)
    const generator = createNoise2DGenerator(noiseConfig)
    const map = createRangeMapper(-1, 1, 0, 255)

    for (let y = 0; y < size.height; ++y) {
        for (let x = 0; x < size.width; ++x) {
            const value = map(generator({x, y}))
            const index = 4*(y*size.width + x)

            imageData.data[index + 0] = value
            imageData.data[index + 1] = value
            imageData.data[index + 2] = value
            imageData.data[index + 3] = 255
        }
    }
    return imageData
}

registerPromiseWorker((options: {
    noiseConfig?: TNoise2DGeneratorOptions,
    size: TSize,
}) => {
    return noise(options.size, options.noiseConfig ?? {})
})
