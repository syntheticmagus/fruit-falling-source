import { AbstractMesh, MeshBuilder, Scene, TransformNode } from "@babylonjs/core";
import { GameScene, GameSceneState } from "./gameScene";

export class Drop extends TransformNode {
    private _gameScene: GameScene;
    private _mesh: AbstractMesh;
    private _falling: boolean;

    constructor (scene: GameScene) {
        super("drop", scene);

        this._gameScene = scene;
        this._mesh = MeshBuilder.CreateBox("drop_mesh", { size: 0.1 }, scene);
        this._mesh.parent = this;
        this._falling = false;
    }

    public async fallAsync(): Promise<boolean> { 
        if (this._falling) {
            return false;
        }

        this.position.x = 0.5 * (Math.random() - 0.5);
        this.position.y = 1.05;

        this._falling = true;
        await this.getScene().onBeforeRenderObservable.runCoroutineAsync(this.fallCoroutine());
        this._falling = false;
        return true;
    }

    private *fallCoroutine() {
        while (this._gameScene.State === GameSceneState.Raining && this.position.y > -0.05) {
            this.position.y -= 0.005 * this._scene.getAnimationRatio();
            this.rotation.x += 0.025 * this._scene.getAnimationRatio();
            this.rotation.y += 0.010 * this._scene.getAnimationRatio();
            this.rotation.z += 0.005 * this._scene.getAnimationRatio();
            yield;
        }
    }
}