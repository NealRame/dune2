import {
    type TSize,
} from "@nealrame/maths"

import {
    Scene,
} from "@nealrame/scene"

import {
    TDune2GameAssets,
} from "../assets"

import {
    Dune2FogGenerator,
} from "../fog"

import {
    Dune2MapGenerator,
} from "../map"

import {
    Dune2Game,
} from "./game"

import {
    type TDune2GameOptions,
} from "./schema"


export const CELL_SIZE: TSize = Object.freeze({
    width: 16,
    height: 16,
})

export class Dune2GameGenerator {
    async generate(
        canvas: HTMLCanvasElement,
        assets: TDune2GameAssets,
        options: TDune2GameOptions,
    ): Promise<Dune2Game> {
        const mapGenerator = new Dune2MapGenerator()
        const fogGenerator = new Dune2FogGenerator()

        const map = await mapGenerator.generate(options.map)
        const fog = await fogGenerator.generate(map, options.spawnZone)
        const scene = await Scene.create(CELL_SIZE, map.size, canvas)

        return new Dune2Game(assets, fog, map, scene)
    }
}
