import { Color3, Color4, Engine, Material, Scene, SpotLight, StandardMaterial, Tools, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
import { Drop } from "./drop";
import { OrthoCamera } from "./orthoCamera";
import { RainbowButton } from "./rainbowButton";

export enum GameSceneState {
    Raining,
    Ending
};

export enum GameButtonColors {
    Red = 0,
    Orange = 1,
    Yellow = 2,
    Green = 3,
    Blue = 4,
    Purple = 5
}

export class GameScene extends Scene {
    private _state: GameSceneState;
    private _camera: OrthoCamera;
    private _buttons: Array<RainbowButton>;
    private _drops: Set<Drop>;

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
            const height = 0.12 * (idx + 1);
            this._buttons[idx] = new RainbowButton(this, colors[idx], height);
            this._buttons[idx].onClickedObservable.add(() => {
                this._handleButtonPressed(height, idx);
            });
        }

        this.dropMaterials = new Array<Material>(colors.length);
        for (let idx = 0; idx < colors.length; ++idx) {
            const mat = new StandardMaterial("colored_material", this);
            mat.diffuseColor = colors[idx];
            mat.specularPower = 1000;
            this.dropMaterials[idx] = mat;
        }

        this._drops = new Set<Drop>();

        this.onBeforeRenderObservable.runCoroutineAsync(this._runLightSystem());
        this.onBeforeRenderObservable.runCoroutineAsync(this._rainDropsCoroutine());
    }

    private *_rainDropsCoroutine() {
        while (this._state === GameSceneState.Raining) {
            const drop = new Drop(this);
            this._drops.add(drop);
            drop.fallAsync().then(() => {
                // TODO: Pool these instead of disposing them.
                this._drops.delete(drop);
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

    private _handleButtonPressed(height: number, color: GameButtonColors) {
        this._drops.forEach((drop) => {
            if (Math.abs(drop.position.y - height) < 0.05 && color === drop.Color) {
                drop.Caught = true;
            }
        });
    }
}
