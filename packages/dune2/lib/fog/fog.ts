import {
    type TSize,
    type TPoint,
} from "@nealrame/maths"

import {
    type ISceneTilemapLayer,
} from "@nealrame/scene"

import {
    posToIndex,
} from "../utils"

export class Dune2FogOfWar {
    private fog_: Array<boolean> = []
    private modified_: boolean = true
    
    private getFogTileIndex_(
        {x, y}: TPoint,
    ): number {
        const north = this.isRevealed({ x, y: y - 1 }) ? 0 : 1
        const east  = this.isRevealed({ x: x + 1, y }) ? 0 : 1
        const south = this.isRevealed({ x, y: y + 1 }) ? 0 : 1
        const west  = this.isRevealed({ x: x - 1, y }) ? 0 : 1

        return north | (east << 1) | (south << 2) | (west << 3)
    }

    public constructor(private size_: TSize) {
        this.fog_ = (new Array(this.width*this.height)).fill(false)
    }

    public get size(): TSize {
        return { ...this.size_ }
    }

    public get height() { return this.size_.height }
    public get width()  { return this.size_.width }

    public isRevealed(position: TPoint): boolean {
        const index = posToIndex(position, this.size_)
        
        return index != null
            ? this.fog_[index]
            : false
    }

    public reveal(position: TPoint): this {
        const index = posToIndex(position, this.size_)
        
        if (index != null) {
            if (this.fog_[index]) {
                this.modified_ = this.fog_[index] = true
            }
        }

        return this
    }

    public render(layer: ISceneTilemapLayer): this {
        if (!this.modified_) return this

        this.modified_ = false

        for (let y = 0; y < this.height; ++y) {
        for (let x = 0; x < this.width; ++x) {
            const position = {x, y}
            const textureIndex = 
                this.isRevealed(position)
                    ? -1
                    : this.getFogTileIndex_(position)

            layer.set({ position, textureIndex })
        }}

        return this
    }
}
