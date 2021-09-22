import { Color3, Color4, Engine, Material, Scene, SpotLight, StandardMaterial, Tools, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
import { Drop } from "./drop";
import { OrthoCamera } from "./orthoCamera";
import { RainbowButton } from "./rainbowButton";

export enum GameSceneState {
    Raining,
    Ending
};

export class GameScene extends Scene {
    private _state: GameSceneState;
    private _camera: OrthoCamera;
    private _buttons: Array<RainbowButton>;

    public guiTexture: AdvancedDynamicTexture;
    public dropMaterials: Array<Material>;

    public get State() {
        return this._state;
    }

    constructor (engine: Engine) {
        super(engine);
        this._state = GameSceneState.Raining;
        this._camera = new OrthoCamera(this);
        this.clearColor = new Color4(0, 0, 0, 1);
        this.guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("gui", true, this);

        const colors = [
            new Color3(1.0, 0.0, 0.0),
            new Color3(1.0, 0.5, 0.0),
            new Color3(1.0, 1.0, 0.0),
            new Color3(0.0, 1.0, 0.0),
            new Color3(0.0, 0.0, 1.0),
            new Color3(1.0, 0.0, 1.0)
        ];
        this._buttons = new Array<RainbowButton>(colors.length);
        for (let idx = 0; idx < colors.length; ++idx) {
            this._buttons[idx] = new RainbowButton(this, colors[idx], 0.12 * (idx + 1));
        }

        this.dropMaterials = new Array<Material>(colors.length);
        for (let idx = 0; idx < colors.length; ++idx) {
            const mat = new StandardMaterial("colored_material", this);
            mat.diffuseColor = colors[idx];
            mat.specularPower = 1000;
            this.dropMaterials[idx] = mat;
        }

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
            light.direction.z += 5;
            light.direction.normalize();
        }
        const redLight = new SpotLight("redLight", new Vector3(-3, 3, -5), Vector3.Down(), Math.PI, 1, this);
        redLight.diffuse = new Color3(1.0, 0.3, 0.3);
        const greenLight = new SpotLight("greenLight", new Vector3(0, 3, -5), Vector3.Down(), Math.PI, 1, this);
        greenLight.diffuse = new Color3(0.3, 1.0, 0.3);
        const blueLight = new SpotLight("blueLight", new Vector3(3, 3, -5), Vector3.Down(), Math.PI, 1, this);
        blueLight.diffuse = new Color3(0.3, 0.3, 1.0);
        
        const TIME_SCALE = 1;
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
