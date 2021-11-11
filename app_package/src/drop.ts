import { Observable, Sprite, SpriteManager, TransformNode } from "@babylonjs/core";
import { GameButtonColors, GameScene, GameSceneState } from "./gameScene";

export class Drop extends TransformNode {
    private _gameScene: GameScene;
    private _sprite: Sprite;
    private _falling: boolean;
    private _color?: GameButtonColors;
    private _caught = false;

    public onFinishedFallingObservable: Observable<void>;

    public get Color() {
        return this._color;
    }

    public set Caught(value: boolean) {
        this.position.y = -1;
        this._caught = value;
    }

    constructor (scene: GameScene, spriteManager: SpriteManager) {
        super("drop", scene);

        this._gameScene = scene;

        this._sprite = new Sprite("", spriteManager);
        this._sprite.width = 0.12;
        this._sprite.height = 0.15;
        this._sprite.isVisible = false;

        this._falling = false;

        this.onFinishedFallingObservable = new Observable<void>();
    }

    public async fallAsync(): Promise<boolean> { 
        if (this._falling) {
            return false;
        }

        this.position.x = 0.15 * (Math.random() - 0.5);
        this.position.y = 1.05;
        this.position.z = -1;

        this._falling = true;
        this._gameScene.updateObservable.runCoroutineAsync(this.animateSpriteCoroutine());
        await this._gameScene.onBeforeRenderObservable.runCoroutineAsync(this.fallCoroutine());
        this._falling = false;
        return true;
    }

    private *animateSpriteCoroutine() {
        let frame = 0;
        while (this._falling) {
            if (frame % 4 == 0) {
                this._sprite.cellIndex = (this._sprite.cellIndex + 6) % 24;
            }
            frame += 1;
            yield;
        }
    }

    private *fallCoroutine() {
        this._color = Math.floor(Math.random() * this._gameScene.dropMaterials.length);
        this._sprite.angle = Math.random() - 0.5;
        switch (this._color) {
            case GameButtonColors.Yellow:
                this._sprite.cellIndex = 0;
                break;
            case GameButtonColors.Red:
                this._sprite.cellIndex = 1;
                break;
            case GameButtonColors.Orange:
                this._sprite.cellIndex = 2;
                break;
            case GameButtonColors.Green:
                this._sprite.cellIndex = 3;
                break;
            case GameButtonColors.Blue:
                this._sprite.cellIndex = 4;
                break;
            case GameButtonColors.Purple:
                this._sprite.cellIndex = 5;
                break;
        }
        this._sprite.isVisible = true;

        const FALL_SPEED = 0.005;
        while (this._gameScene.State === GameSceneState.Raining && this.position.y > -0.05) {
            this.position.y -= FALL_SPEED * this._scene.getAnimationRatio();
            this._sprite.position.copyFrom(this.position);
            yield;
        }

        if (this._gameScene.State === GameSceneState.Ending) {
            return;
        }

        if (!this._caught) {
            this.onFinishedFallingObservable.notifyObservers();
        }
        this._caught = false;

        this._color = undefined;
        this._sprite.isVisible = false;
    }
}
