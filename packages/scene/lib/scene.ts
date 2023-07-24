import {
    Context,
} from "./context"

export interface ISceneState {
    onTick(context: Context): void
}

export class Scene {
    private _animationFrameId = 0
    private _running = false

    private _tick = () => {
        if (this._running) {
            this._state.onTick(this._context)
            this._animationFrameId = requestAnimationFrame(this._tick)
        }
    }

    public constructor(
        private _context: Context,
        private _state: ISceneState,
    ) {}

    public start() {
        if (!this._running) {
            this._running = true
            this._context.bind()
            this._animationFrameId = requestAnimationFrame(this._tick)
        }
    }

    public stop() {
        if (this._running) {
            this._running = false
            this._context.unbind()
            cancelAnimationFrame(this._animationFrameId)
        }
    }
}