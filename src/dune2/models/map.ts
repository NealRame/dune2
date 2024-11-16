import {
    range,
} from "../../decorators"

import {
    Dune2MapGeneratorConfigDefault,
} from "../map"

import type {
    TDune2MapGeneratorSizeConfig,
    TDune2MapGeneratorSpiceOptions,
    TDune2MapGeneratorTerrainOptions,
} from "../types"


export class Dune2MapSizeConfigModel implements TDune2MapGeneratorSizeConfig {
    @range({
        min: 1,
        max: 256,
        step: 1,
    }) public width = 3

    @range({
        min: 1,
        max: 256,
        step: 1,
    }) public height = 2

    clone() {
        const size = new Dune2MapSizeConfigModel()

        size.width = this.width
        size.height = this.height

        return size
    }
}

export class Dune2MapSpiceConfigModel
    implements Required<TDune2MapGeneratorSpiceOptions>
{
    @range({
        label: "scale",
        min: 8,
        max: 256,
        step: 1,
    }) public scale =
        Dune2MapGeneratorConfigDefault.spice.scale

    @range({
        label: "details",
        min: 1,
        max: 8,
        step: 1,
    }) public details =
        Dune2MapGeneratorConfigDefault.spice.details
    
    @range({
        label: "spice threshold",
        min: 0,
        max: 1,
        step: 0.01,
    }) public threshold =
        Dune2MapGeneratorConfigDefault.spice.threshold

    @range({
        label: "spice saturation threshold",
        min: 0,
        max: 1,
        step: 0.01,
    }) public saturationThreshold =
        Dune2MapGeneratorConfigDefault.spice.saturationThreshold

    public clone() {
        const config = new Dune2MapSpiceConfigModel()

        config.scale = this.scale
        config.details = this.details
        config.threshold = this.threshold
        config.saturationThreshold = this.saturationThreshold

        return config
    }
}

export class Dune2MapTerrainConfigModel
    implements Required<TDune2MapGeneratorTerrainOptions>
{
    @range({
        label: "scale",
        min: 8,
        max: 256,
        step: 1,
    }) public scale =
        Dune2MapGeneratorConfigDefault.terrain.scale

    @range({
        label: "details",
        min: 1,
        max: 8,
        step: 1,
    }) public details =
        Dune2MapGeneratorConfigDefault.terrain.details

    @range({
        label: "sand threshold",
        min: 0,
        max: 1,
        step: 0.01,
    }) public sandThreshold =
        Dune2MapGeneratorConfigDefault.terrain.sandThreshold

    @range({
        label: "rock threshold",
        min: 0,
        max: 1,
        step: 0.01,
    }) public rockThreshold =
        Dune2MapGeneratorConfigDefault.terrain.rockThreshold

    @range({
        label: "moutain threshold",
        min: 0,
        max: 1,
        step: 0.01,
    }) public mountainsThreshold =
        Dune2MapGeneratorConfigDefault.terrain.mountainsThreshold

    public clone() {
        const config = new Dune2MapTerrainConfigModel()

        config.scale = this.scale
        config.details = this.details
        config.sandThreshold = this.sandThreshold
        config.rockThreshold = this.rockThreshold
        config.mountainsThreshold = this.mountainsThreshold

        return config
    }
}
