import {
    type IScene,
    ISceneTilemapLayer,
    SceneTilemapLayer,
} from "@nealrame/scene"

import {
    TDune2GameAssets,
} from "../assets"

import {
    Dune2FogOfWar,
} from "../fog"

import {
    Dune2Map,
} from "../map"


export class Dune2Game {
    private mapLayer_!: ISceneTilemapLayer
    private fogLayer_!: ISceneTilemapLayer

    private tick_ = () => {
        this.fog_.render(this.fogLayer_)
        this.map_.render(this.mapLayer_)
        this.scene_.render()
    }

    private initializeLayers_(): void {
        this.scene_.clear()

        const mapLayer = this.scene_.addLayer(SceneTilemapLayer, {
            name: "map",
            texture: this.assets_.textures["terrain"]
        })
        if (mapLayer == null) {
            throw new Error("Failed to create map layer")
        }

        const fogLayer = this.scene_.addLayer(SceneTilemapLayer, {
            name: "fog-of-war",
            texture: this.assets_.textures["fog"]
        })
        if (fogLayer == null) {
            throw new Error("Failed to create fog layer")
        }

        this.mapLayer_ = mapLayer
        this.fogLayer_ = fogLayer
    }

    public constructor(
        private assets_: TDune2GameAssets,
        private fog_: Dune2FogOfWar,
        private map_: Dune2Map,
        private scene_: IScene,
    ) {
        this.initializeLayers_()
    }

    public get scene(): IScene {
        return this.scene_
    }

    public start() {
        this.scene_.start(this.tick_)
    }

    public stop() {
        this.scene_.stop()
    }
}
