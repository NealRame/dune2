import {
    range,
} from "../../decorators"

import {
    Dune2MapGeneratorConfigDefault,
} from "../map"

import type {
    TDune2MapGeneratorSizeConfig,
    TDune2MapGeneratorSpiceConfig,
    TDune2MapGeneratorTerrainConfig,
} from "../schema"


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

    public static get default(): Dune2MapSizeConfigModel {
        return new Dune2MapSizeConfigModel()
    }
    
    public static from(
        config: TDune2MapGeneratorSizeConfig,
    ): Dune2MapSizeConfigModel {
        const newConfig = new Dune2MapSizeConfigModel()

        newConfig.width = config.width
        newConfig.height = config.height

        return newConfig
    }
}

export class Dune2MapSpiceConfigModel
    implements TDune2MapGeneratorSpiceConfig
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

    public static get default(): Dune2MapSpiceConfigModel {
        return new Dune2MapSpiceConfigModel()
    }

    public static from(
        config: TDune2MapGeneratorSpiceConfig,
    ): Dune2MapSpiceConfigModel {
        const newConfig = new Dune2MapSpiceConfigModel()

        newConfig.scale = config.scale
        newConfig.details = config.details
        newConfig.threshold = config.threshold
        newConfig.saturationThreshold = config.saturationThreshold
        
        return newConfig
    }
}

export class Dune2MapTerrainConfigModel
    implements TDune2MapGeneratorTerrainConfig {
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

    public static get default(): Dune2MapTerrainConfigModel {
        return new Dune2MapTerrainConfigModel()
    }
    
    public static from(
        config: TDune2MapGeneratorTerrainConfig,
    ): Dune2MapTerrainConfigModel {
        const newConfig = new Dune2MapTerrainConfigModel()

        newConfig.scale = config.scale
        newConfig.details = config.details
        newConfig.sandThreshold = config.sandThreshold
        newConfig.rockThreshold = config.rockThreshold
        newConfig.mountainsThreshold = config.mountainsThreshold
        
        return newConfig
    }
}
