import { z } from "zod"

export const Dune2MapGeneratorSizeConfigSchema = z.object({
    width: z.number(),
    height: z.number(),
})
export type TDune2MapGeneratorSizeConfig =
    z.infer<typeof Dune2MapGeneratorSizeConfigSchema>

export const Dune2MapGeneratorTerrainConfigSchema = z.object({
    scale: z.number(),
    details: z.number(),
    sandThreshold: z.number().min(0).max(1),
    rockThreshold: z.number().min(0).max(1),
    mountainsThreshold: z.number().min(0).max(1),
})
export type TDune2MapGeneratorTerrainConfig =
    z.infer<typeof Dune2MapGeneratorTerrainConfigSchema>

export const Dune2MapGeneratorSpiceConfigSchema = z.object({
    scale: z.number(),
    details: z.number(),
    threshold: z.number().min(0).max(1),
    saturationThreshold: z.number().min(0).max(1),
})
export type TDune2MapGeneratorSpiceConfig =
    z.infer<typeof Dune2MapGeneratorSpiceConfigSchema>

export const Dune2MapGeneratorConfigSchema = z.object({
    seed: z.number(),
    size: Dune2MapGeneratorSizeConfigSchema,
    terrain: Dune2MapGeneratorTerrainConfigSchema,
    spice: Dune2MapGeneratorSpiceConfigSchema,
})
export type TDune2MapGeneratorConfig =
    z.infer<typeof Dune2MapGeneratorConfigSchema>

export const Dune2MapGeneratorOptionsSchema = z.object({
    seed: z.number(),
    size: Dune2MapGeneratorSizeConfigSchema,
    terrain: Dune2MapGeneratorTerrainConfigSchema.partial().optional(),
    spice: Dune2MapGeneratorSpiceConfigSchema.partial().optional(),
})
export type TDune2MapGeneratorOptionsConfig =
    z.infer<typeof Dune2MapGeneratorOptionsSchema>
