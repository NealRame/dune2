import { z } from "zod"

export const DuneMapGeneratorSizeSchema = z.object({
    width: z.number(),
    height: z.number(),
}).required()
export type TDuneMapGeneratorSizeConfig =
    z.infer<typeof DuneMapGeneratorSizeSchema>

export const DuneMapGeneratorTerrainSchema = z.object({
    scale: z.number(),
    details: z.number(),
    sandThreshold: z.number().min(0).max(1),
    rockThreshold: z.number().min(0).max(1),
    mountainsThreshold: z.number().min(0).max(1),
}).required()
export type TDuneMapGeneratorTerrainConfig =
    z.infer<typeof DuneMapGeneratorTerrainSchema>

export const DuneMapGeneratorSpiceSchema = z.object({
    scale: z.number(),
    details: z.number(),
    threshold: z.number().min(0).max(1),
    saturationThreshold: z.number().min(0).max(1),
})
export type TDuneMapGeneratorSpiceConfig =
    z.infer<typeof DuneMapGeneratorSpiceSchema>

export const DuneMapGeneratorConfigSchema = z.object({
    seed: z.number(),
    size: DuneMapGeneratorSizeSchema,
    terrain: DuneMapGeneratorTerrainSchema,
    spice: DuneMapGeneratorSpiceSchema,
}).required()
export type TDuneMapGeneratorConfigConfig =
    z.infer<typeof DuneMapGeneratorConfigSchema>
