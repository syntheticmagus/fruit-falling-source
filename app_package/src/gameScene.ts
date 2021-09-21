import { Engine, Scene, Tools } from "@babylonjs/core";
import { OrthoCamera } from "./orthoCamera";

enum GameSceneState {
    Raining,
    Ending
};
export class GameScene extends Scene {
    private _state: GameSceneState;
    private _camera: OrthoCamera;

    constructor (engine: Engine) {
        super(engine);
        this._state = GameSceneState.Raining;
        this._camera = new OrthoCamera(this);

        // TODO: Create the buttons.

        this.onBeforeRenderObservable.runCoroutineAsync(this._rainDropsCoroutine());
    }

    private *_rainDropsCoroutine() {
        while (this._state === GameSceneState.Raining) {
            // TODO: Spawn a new drop.
            console.log("Drop!");
            yield Tools.DelayAsync(1000);
        }
    }
}
