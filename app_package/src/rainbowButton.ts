import { AbstractMesh, Color3, MeshBuilder, Observable, PBRMaterial, Sprite, SpriteManager, TransformNode } from "@babylonjs/core";
import { Button } from "@babylonjs/gui";
import { GameScene } from "./gameScene";

export class RainbowButton extends TransformNode {
    private _gameScene: GameScene;
    private _material: PBRMaterial;
    private _frameSprite: Sprite;
    private _faceSprite: Sprite;
    private _background: AbstractMesh;
    private _button: Button;
    
    public onClickedObservable: Observable<void>;

    constructor (scene: GameScene, frameSpriteManager: SpriteManager, faceSpriteManager: SpriteManager, color: Color3, height: number) {
        super("rainbowButton", scene);
        this._gameScene = scene;

        this._frameSprite = new Sprite("", frameSpriteManager);
        this._frameSprite.width = 0.13 * 7 / 2;
        this._frameSprite.height = 0.13;
        this._frameSprite.position.y = height;

        this._background = MeshBuilder.CreatePlane("", {width: 0.13 * 6.42 / 2, height: 0.13 * 1.57 / 2}, scene);
        this._background.position.x = 0.13 * -0.064 / 2;
        this._background.position.z = 0.001;
        this._background.position.y = height;
        this._material = new PBRMaterial("", scene);
        this._material.unlit = true;
        this._material.albedoColor = color;
        this._background.material = this._material;

        this._faceSprite = new Sprite("", faceSpriteManager);
        this._faceSprite.width = 0.1 * 7 / 2;
        this._faceSprite.height = 0.1;
        this._faceSprite.position.y = height;

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
        this._gameScene.onBeforeRenderObservable.runCoroutineAsync(this._randomFrameAnimation());
        this._gameScene.onBeforeRenderObservable.runCoroutineAsync(this._faceAnimation());
    }

    private *_onClickCoroutine() {
        const SCALE = 0.95;
        this._frameSprite.width *= SCALE;
        this._frameSprite.height *= SCALE;
        this._background.scaling.scaleInPlace(SCALE);

        yield;
        yield;
        yield;
        
        this._frameSprite.width *= 1 / SCALE;
        this._frameSprite.height *= 1 / SCALE;
        this._background.scaling.scaleInPlace(1 / SCALE)
    }

    private *_randomFrameAnimation() {
        const THRESHOLD = 0.5;
        let rand = 0;
        while (true) {
            rand = Math.random();
            if (rand < THRESHOLD) {
                this._frameSprite.cellIndex = Math.floor(5 * rand / THRESHOLD);
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

    private *_faceAnimation() {
        // const FULL_FRAMES = [0, 4, 8, 12, 16, 1, 5, 9, 13, 17, 20, 21, 24, 25, 28, 29, 2, 6, 10, 14, 18, 22, 26, 30, 32, 33, 34, 36, 37, 38, 3, 7, 11, 15, 19, 23, 27, 31];
        const GRIN_FRAMES = [0, 4, 8, 21, 22, 27, 31, 37, 38];
        const GRIN_TO_STRAIGHT_FRAMES = [12, 16];
        const STRAIGHT_FRAMES = [1, 5, 9, 13];
        const STRAIGHT_TO_GRIN_FRAMES = [17, 20];
        const CHOMP_FRAMES = [24, 25, 28, 29, 2, 6, 10, 14, 18];
        const GRIN_TO_SMILE_FRAMES = [26, 30];
        const SMILE_FRAMES = [32, 33, 34];
        const SMILE_TO_GRIN_FRAMES = [36];
        const GRIN_TO_BLEH_FRAMES = [3, 7];
        const BLEH_FRAMES = [11, 15];
        const BLEH_TO_GRIN_FRAMES = [19, 23];

        const FRAMES = GRIN_FRAMES.concat(
            GRIN_TO_STRAIGHT_FRAMES,
            STRAIGHT_FRAMES,
            STRAIGHT_FRAMES,
            STRAIGHT_TO_GRIN_FRAMES,
            GRIN_FRAMES,
            CHOMP_FRAMES,
            GRIN_TO_BLEH_FRAMES,
            BLEH_FRAMES,
            BLEH_FRAMES,
            BLEH_TO_GRIN_FRAMES,
            GRIN_FRAMES,
            CHOMP_FRAMES,
            GRIN_TO_SMILE_FRAMES,
            SMILE_FRAMES,
            SMILE_FRAMES,
            SMILE_TO_GRIN_FRAMES
        );

        let idx = 0;
        while (true) {
            idx = (idx + 1) % FRAMES.length;
            this._faceSprite.cellIndex = FRAMES[idx];
            yield;
            yield;
            yield;
            yield;
            yield;
            yield;
        }
    }
}
