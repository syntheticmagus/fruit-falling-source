import { AbstractMesh, Color3, MeshBuilder, Observable, PBRMaterial, Sprite, SpriteManager, StandardMaterial, Tools, TransformNode } from "@babylonjs/core";
import { Button } from "@babylonjs/gui";
import { GameScene, GameSceneState } from "./gameScene";

export class RainbowButton extends TransformNode {
    private _gameScene: GameScene;
    private _material: PBRMaterial;
    private _sprite: Sprite;
    private _background: AbstractMesh;
    private _button: Button;
    
    public onClickedObservable: Observable<void>;

    constructor (scene: GameScene, spriteManager: SpriteManager, color: Color3, height: number) {
        super("rainbowButton", scene);
        this._gameScene = scene;

        this._sprite = new Sprite("", spriteManager);
        this._sprite.width = 0.13 * 7 / 2;
        this._sprite.height = 0.13;
        this._sprite.position.y = height;

        this._background = MeshBuilder.CreatePlane("", {width: 0.13 * 6.42 / 2, height: 0.13 * 1.57 / 2}, scene);
        this._background.position.x = 0.13 * -0.064 / 2;
        this._background.position.z = 0.001;
        this._background.position.y = height;
        this._material = new PBRMaterial("", scene);
        this._material.unlit = true;
        this._material.albedoColor = color;
        this._background.material = this._material;

        this._button = Button.CreateSimpleButton("rainbowButton_button", "");
        this._button.widthInPixels = this._gameScene.getEngine().getRenderWidth() * 0.8;
        this._button.heightInPixels = this._gameScene.getEngine().getRenderHeight() * 0.1;
        this._button.thickness = 0;
        this._gameScene.guiTexture.addControl(this._button);
        this._button.linkWithMesh(this._background);

        this.onClickedObservable = new Observable<void>();

        this._button.onPointerDownObservable.add(() => {
            this._gameScene.onBeforeRenderObservable.runCoroutineAsync(this._onClickCoroutine());
            this.onClickedObservable.notifyObservers();
        });
        this._gameScene.onBeforeRenderObservable.runCoroutineAsync(this._randomAnimation());
    }

    private *_onClickCoroutine() {
        const SCALE = 0.95;
        this._sprite.width *= SCALE;
        this._sprite.height *= SCALE;
        this._background.scaling.scaleInPlace(SCALE);

        yield;
        yield;
        yield;
        
        this._sprite.width *= 1 / SCALE;
        this._sprite.height *= 1 / SCALE;
        this._background.scaling.scaleInPlace(1 / SCALE)
    }

    private *_randomAnimation() {
        const THRESHOLD = 0.5;
        let rand = 0;
        while (true) {
            rand = Math.random();
            if (rand < THRESHOLD) {
                this._sprite.cellIndex = Math.floor(5 * rand / THRESHOLD);
                yield;
                yield;
                yield;
                yield;
                yield;
                yield;
                yield;
                yield;
            }
            yield;
        }
    }
}
