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
    private _activeDrops: Set<Drop>;
    private _inactiveDrops: Set<Drop>;
    private _failures: number;

    private get failures(): number {
        return this._failures;
    }

    private set failures(value: number) {
        this._failures = value;
        // TODO: If failures are too large, stop the game.
    }

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

        this._activeDrops = new Set<Drop>();
        this._inactiveDrops = new Set<Drop>();
        this._failures = 0;

        this.onBeforeRenderObservable.runCoroutineAsync(this._runLightSystem());
        this.onBeforeRenderObservable.runCoroutineAsync(this._rainDropsCoroutine());
    }

    private *_rainDropsCoroutine() {
        while (this._state === GameSceneState.Raining) {
            let drop: Drop;
            if (this._inactiveDrops.size > 0) {
                drop = this._inactiveDrops.values().next().value;
                this._inactiveDrops.delete(drop);
                this._activeDrops.add(drop);
            } else {
                drop = new Drop(this);
                drop.onFinishedFallingObservable.add(() => {
                    this.failures += 1;
                });
            }
            this._activeDrops.add(drop);
            drop.fallAsync().then(() => {
                this._activeDrops.delete(drop);
                this._inactiveDrops.add(drop);
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
        while (this._state === GameSceneState.Raining) { 
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
        this._activeDrops.forEach((drop) => {
            if (Math.abs(drop.position.y - height) < 0.05) {
                drop.Caught = true;
                if (color === drop.Color) {
                    // TODO: Increment success.
                } else {
                    this.failures += 1;
                    // TODO: When failures are too large, switch to endgame UI.
                }
            }
        });
    }
}
