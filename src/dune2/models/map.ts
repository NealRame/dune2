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


export class Dune2MapSizeConfig implements TDune2MapGeneratorSizeConfig {
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

export class Dune2MapSpiceConfig
    implements Required<TDune2MapGeneratorSpiceOptions>
{
    @range({
        min: 8,
        max: 256,
        step: 1,
    }) public spiceScale =
        Dune2MapGeneratorConfigDefault.spiceScale

    @range({
        min: 1,
        max: 8,
        step: 1,
    }) public spiceDetails =
        Dune2MapGeneratorConfigDefault.spiceDetails
    
    @range({
        min: 0,
        max: 1,
        step: 0.01,
    }) public spiceThreshold =
        Dune2MapGeneratorConfigDefault.spiceThreshold

    @range({
        min: 0,
        max: 1,
        step: 0.01,
    }) public spiceSaturationThreshold =
        Dune2MapGeneratorConfigDefault.spiceSaturationThreshold
}

export class Dune2MapTerrainConfig
    implements Required<TDune2MapGeneratorTerrainOptions>
{
    @range({
        min: 8,
        max: 256,
        step: 1,
    }) public terrainScale =
        Dune2MapGeneratorConfigDefault.terrainScale

    @range({
        min: 1,
        max: 8,
        step: 1,
    }) public terrainDetails =
        Dune2MapGeneratorConfigDefault.terrainDetails

    @range({
        min: 0,
        max: 1,
        step: 0.01,
    }) public terrainSandThreshold =
        Dune2MapGeneratorConfigDefault.terrainSandThreshold

    @range({
        min: 0,
        max: 1,
        step: 0.01,
    }) public terrainRockThreshold =
        Dune2MapGeneratorConfigDefault.terrainRockThreshold

    @range({
        min: 0,
        max: 1,
        step: 0.01,
    }) public terrainMountainsThreshold =
        Dune2MapGeneratorConfigDefault.terrainMountainsThreshold
}
