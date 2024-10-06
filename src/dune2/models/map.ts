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
        min: 8,
        max: 256,
        step: 1,
    }) public width = 64

    @range({
        min: 8,
        max: 256,
        step: 1,
    }) public height = 64
}

export class Dune2MapSpiceConfigModel
    implements Required<TDune2MapGeneratorSpiceOptions>
{
    @range({
        label: "scale",
        min: 8,
        max: 256,
        step: 1,
    }) public spiceScale =
        Dune2MapGeneratorConfigDefault.spiceScale

    @range({
        label: "details",
        min: 1,
        max: 8,
        step: 1,
    }) public spiceDetails =
        Dune2MapGeneratorConfigDefault.spiceDetails
    
    @range({
        label: "spice threshold",
        min: 0,
        max: 1,
        step: 0.01,
    }) public spiceThreshold =
        Dune2MapGeneratorConfigDefault.spiceThreshold

    @range({
        label: "spice saturation threshold",
        min: 0,
        max: 1,
        step: 0.01,
    }) public spiceSaturationThreshold =
        Dune2MapGeneratorConfigDefault.spiceSaturationThreshold
}

export class Dune2MapTerrainConfigModel
    implements Required<TDune2MapGeneratorTerrainOptions>
{
    @range({
        label: "scale",
        min: 8,
        max: 256,
        step: 1,
    }) public terrainScale =
        Dune2MapGeneratorConfigDefault.terrainScale

    @range({
        label: "details",
        min: 1,
        max: 8,
        step: 1,
    }) public terrainDetails =
        Dune2MapGeneratorConfigDefault.terrainDetails

    @range({
        label: "sand threshold",
        min: 0,
        max: 1,
        step: 0.01,
    }) public terrainSandThreshold =
        Dune2MapGeneratorConfigDefault.terrainSandThreshold

    @range({
        label: "rock threshold",
        min: 0,
        max: 1,
        step: 0.01,
    }) public terrainRockThreshold =
        Dune2MapGeneratorConfigDefault.terrainRockThreshold

    @range({
        label: "moutain threshold",
        min: 0,
        max: 1,
        step: 0.01,
    }) public terrainMountainsThreshold =
        Dune2MapGeneratorConfigDefault.terrainMountainsThreshold
}
