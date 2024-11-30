import { z } from "zod"

export const Dune2FogGeneratorSpawnPointConfigSchema = z.object({
    x: z.number(),
    y: z.number(),
})

export const Dune2FogGeneratorSpawnZoneConfigSchema = z.object({
    radius: z.number(),
    spawnPoint: Dune2FogGeneratorSpawnPointConfigSchema,
})

export type TDune2FogGeneratorSpawnZoneConfig =
    z.infer<typeof Dune2FogGeneratorSpawnZoneConfigSchema>

export const Dune2FogGeneratorSpawnZoneOptionsSchema =
    Dune2FogGeneratorSpawnZoneConfigSchema.partial()

export type TDune2FogGeneratorSpawnZoneOptions =
    z.infer<typeof Dune2FogGeneratorSpawnZoneOptionsSchema>
