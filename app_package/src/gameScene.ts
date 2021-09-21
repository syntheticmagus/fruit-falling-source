import { Color3, Color4, Engine, Scene, SpotLight, Tools, Vector3 } from "@babylonjs/core";
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

        // TODO: Create the buttons.

        this.onBeforeRenderObservable.runCoroutineAsync(this._runLightSystem());
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

    private *_runLightSystem() {
        const setLightDirection = (light: SpotLight) => {
            light.direction.copyFrom(light.position);
            light.direction.negateInPlace();
            light.direction.normalize();
        }
        const redLight = new SpotLight("redLight", new Vector3(-3, 3, -5), Vector3.Down(), Math.PI / 6, 1, this);
        redLight.diffuse = Color3.Red();
        const greenLight = new SpotLight("greenLight", new Vector3(0, 3, -5), Vector3.Down(), Math.PI / 6, 1, this);
        greenLight.diffuse = Color3.Green();
        const blueLight = new SpotLight("blueLight", new Vector3(3, 3, -5), Vector3.Down(), Math.PI / 6, 1, this);
        blueLight.diffuse = Color3.Blue();
        
        const TIME_SCALE = 10;
        let t = 0;
        while (true) { 
            t += (TIME_SCALE / (60 * this.getAnimationRatio()));
            redLight.position.x = 3 * Math.sin(t);
            greenLight.position.x = 3 * Math.cos(t);
            blueLight.position.x = 3 * Math.sin(-1.5 * t);

            redLight.position.y = 3 * Math.sin(-t) + 1;
            greenLight.position.y = 3 * Math.sin(1.5 * t) + 1;
            blueLight.position.y = 3 * Math.cos(-0.8 * t) + 1;

            setLightDirection(redLight);
            setLightDirection(greenLight);
            setLightDirection(blueLight);

            yield;
        }
    }
}
