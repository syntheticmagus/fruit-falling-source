import { AbstractMesh, MeshBuilder, Scene, TransformNode } from "@babylonjs/core";
import { GameScene, GameSceneState } from "./gameScene";

export class Drop extends TransformNode {
    private _gameScene: GameScene;
    private _mesh: AbstractMesh;
    private _falling: boolean;

    constructor (scene: GameScene) {
        super("drop", scene);

        this._gameScene = scene;

        this._mesh = MeshBuilder.CreateBox("drop_mesh", { size: 0.05 }, scene);
        this._mesh.parent = this;
        this._mesh.isVisible = false;

        this._falling = false;
    }

    public async fallAsync(): Promise<boolean> { 
        if (this._falling) {
            return false;
        }

        this.position.x = 0.3 * (Math.random() - 0.5);
        this.position.y = 1.05;

        this._falling = true;
        await this.getScene().onBeforeRenderObservable.runCoroutineAsync(this.fallCoroutine());
        this._falling = false;
        return true;
    }

    private *fallCoroutine() {
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

        this._mesh.isVisible = false;
    }
}