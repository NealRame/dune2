import {
    makeNoise2D,
} from "open-simplex-noise"

import {
    clamp,
} from "./clamp"

import {
    type TNoise2DGenerator,
} from "./types"


export enum ENoiseFunction {
    None = "none",
    Invert = "invert",
    Billowy = "billowy",
    Ridged = "ridged",
}

export type TNoiseOptions = {
    // Initial amplitude of the noise.
    // Default to 1.0
    amplitude?: number

    // Octave count i.e. the number of levels of detail.
    // Value will be clamped to the range [1, Infinity[.
    // Default to 1.0
    octaves?: number

    // Initial frequency of the noise.
    // Default to 1.0
    frequency?: number

    // Frequency multiplier between successive octaves.
    // Default to 0.5
    persistence?: number

    // Scale of the noise.
    // Value will be clamped to the range [Number.MIN_VALUE, Infinity[.
    // Default to 1.0
    scale?: number

    // Seed of the noise.
    // Default to Date.now().
    seed?: number

    // Noise function.
    // Default to none.
    type?: ENoiseFunction
}

export type TNoiseConfig = Required<TNoiseOptions>

export const FBMConfigDefaults: Readonly<TNoiseConfig> = {
    amplitude: 1.0,
    octaves: 1.0,
    frequency: 1.0,
    persistence: 0.5,
    scale: 1.0,
    seed: Date.now(),
    type: ENoiseFunction.None,
}

function invert(
    fn: TNoise2DGenerator,
): TNoise2DGenerator {
    return (x, y) => -1*fn(x, y)
}

function billowy(
    fn: TNoise2DGenerator,
): TNoise2DGenerator {
    return (x, y) => 2*Math.abs(fn(x, y)) - 1
}

function ridged(
    fn: TNoise2DGenerator,
): TNoise2DGenerator {
    return (x, y) => 2*(1 - Math.abs(fn(x, y))) - 1
}

function createNoise(
    config: TNoiseConfig,
): TNoise2DGenerator {
    const noise = makeNoise2D(config.seed)
    switch (config.type) {
        case ENoiseFunction.None:
            return noise
        case ENoiseFunction.Invert:
            return invert(noise)
        case ENoiseFunction.Billowy:
            return billowy(noise)
        case ENoiseFunction.Ridged:
            return ridged(noise)
    }
    const exhaustiveCheck: never = config.type
    throw new Error(exhaustiveCheck)
}

function ensureNoiseConfig(
    options: TNoiseOptions,
): TNoiseConfig {
    const config = Object.assign({},
        FBMConfigDefaults,
        options,
    )

    config.octaves = clamp(1, Infinity, config.octaves)
    config.scale = clamp(Number.MIN_VALUE, Infinity, config.scale)

    return config
}

export function createNoise2DGenerator(
    options: TNoiseOptions = {},
): TNoise2DGenerator {
    const config = ensureNoiseConfig(options)
    const noise = createNoise(config)
    const {
        scale,
        amplitude,
        frequency,
        octaves,
        persistence,
    } = config

    return (x: number, y: number): number => {
        x /= scale
        y /= scale
        let value = 0
        for (let octave = 0; octave < octaves; octave++) {
            x *= 2*frequency
            y *= 2*frequency
            value += noise(x, y)*(amplitude*Math.pow(persistence, octave))
        }
        return value/(2 - 1/Math.pow(2, octaves - 1))
    }
}
