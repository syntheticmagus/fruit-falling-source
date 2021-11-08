import { AbstractMesh, MeshBuilder, Observable, Scene, TransformNode } from "@babylonjs/core";
import { GameButtonColors, GameScene, GameSceneState } from "./gameScene";

export class Drop extends TransformNode {
    private _gameScene: GameScene;
    private _mesh: AbstractMesh;
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

    constructor (scene: GameScene) {
        super("drop", scene);

        this._gameScene = scene;

        this._mesh = MeshBuilder.CreateBox("drop_mesh", { size: 0.05 }, scene);
        this._mesh.parent = this;
        this._mesh.isVisible = false;

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
        await this.getScene().onBeforeRenderObservable.runCoroutineAsync(this.fallCoroutine());
        this._falling = false;
        return true;
    }

    private *fallCoroutine() {
        this._color = Math.floor(Math.random() * this._gameScene.dropMaterials.length);
        this._mesh.material = this._gameScene.dropMaterials[this._color!];
        this._mesh.isVisible = true;

        const FALL_SPEED = 0.005;
        const ROTATION_X = 0.1 * (Math.random() - 0.5);
        const ROTATION_Y = 0.1 * (Math.random() - 0.5);
        const ROTATION_Z = 0.1 * (Math.random() - 0.5);
        while (this._gameScene.State === GameSceneState.Raining && this.position.y > -0.05) {
            this.position.y -= FALL_SPEED * this._scene.getAnimationRatio();
            this.rotation.x += ROTATION_X * this._scene.getAnimationRatio();
            this.rotation.y += ROTATION_Y * this._scene.getAnimationRatio();
            this.rotation.z += ROTATION_Z * this._scene.getAnimationRatio();
            yield;
        }

        if (!this._caught) {
            this.onFinishedFallingObservable.notifyObservers();
        }
        this._caught = false;

        this._color = undefined;
        this._mesh.isVisible = false;
    }
}