import { BabylonFileLoaderConfiguration, Color4, Engine, Light, PointLight, Scene, Tools, Vector3 } from "@babylonjs/core";
import { Drop } from "./drop";
import { OrthoCamera } from "./orthoCamera";

export enum GameSceneState {
    Raining,
    Ending
};

export class GameScene extends Scene {
    private _state: GameSceneState;
    private _camera: OrthoCamera;

    public get State() {
        return this._state;
    }

    constructor (engine: Engine) {
        super(engine);
        this._state = GameSceneState.Raining;
        this._camera = new OrthoCamera(this);
        this.clearColor = new Color4(0, 0, 0, 1);

        const light = new PointLight("light", new Vector3(0, 10, -5), this);

        // TODO: Create the buttons.

        this.onBeforeRenderObservable.runCoroutineAsync(this._rainDropsCoroutine());
    }

    private *_rainDropsCoroutine() {
        while (this._state === GameSceneState.Raining) {
            const drop = new Drop(this);
            drop.fallAsync().then(() => {
                // TODO: Pool these instead of disposing them.
                drop.dispose();
            });
            yield Tools.DelayAsync(1000);
        }
    }
}
