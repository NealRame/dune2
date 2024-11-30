import { z } from "zod"

import {
    Dune2FogGeneratorSpawnZoneOptionsSchema,
} from "../fog"

import {
    Dune2MapGeneratorOptionsSchema,
} from "../map"


export const Dune2GameOptionsSchema = z.object({
    map: Dune2MapGeneratorOptionsSchema,
    spawnZone: Dune2FogGeneratorSpawnZoneOptionsSchema,
})
export type TDune2GameOptions = z.infer<typeof Dune2GameOptionsSchema>
