import { AbstractMesh, Color3, MeshBuilder, StandardMaterial, Tools } from "@babylonjs/core";
import { GameScene, GameSceneState } from "./gameScene";

export class RainbowButton {
    private _scene: GameScene;
    private _material: StandardMaterial;
    private _mesh: AbstractMesh;

    constructor (scene: GameScene, color: Color3, height: number) {
        this._scene = scene;

        this._material = new StandardMaterial("rainbowButton_mat", this._scene);
        this._material.diffuseColor = color;
        this._material.specularPower = 1000;

        this._mesh = MeshBuilder.CreateBox("rainbowButton_mesh", { width: 0.4, height: 0.1, depth: 0.1 }, this._scene);
        this._mesh.material = this._material;
        this._mesh.position.y = height;

        Tools.DelayAsync(3000 + Math.random() * 3000).then(() => {
            this._scene.onBeforeRenderObservable.runCoroutineAsync(this.spinAnimationCoroutine());
        });
    }

    private *spinAnimationCoroutine() {
        this._mesh.rotation.x = Math.sign(Math.random() - 0.5) * 10;
        while (Math.abs(this._mesh.rotation.x) > 0.1) {
            if (this._scene.State !== GameSceneState.Raining) {
                return;
            }

            this._mesh.rotation.x *= 0.92;
            yield;
        }
        this._mesh.rotation.x = 0;
    }
}
