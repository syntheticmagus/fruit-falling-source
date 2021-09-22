import { AbstractMesh, Color3, MeshBuilder, Observable, StandardMaterial, Tools, TransformNode } from "@babylonjs/core";
import { Button } from "@babylonjs/gui";
import { GameScene, GameSceneState } from "./gameScene";

export class RainbowButton extends TransformNode {
    private _gameScene: GameScene;
    private _material: StandardMaterial;
    private _mesh: AbstractMesh;
    private _button: Button;
    
    public onClickedObservable: Observable<void>;

    constructor (scene: GameScene, color: Color3, height: number) {
        super("rainbowButton", scene);
        this._gameScene = scene;

        this._material = new StandardMaterial("rainbowButton_mat", this._gameScene);
        this._material.diffuseColor = color;
        this._material.specularPower = 1000;

        this._mesh = MeshBuilder.CreateBox("rainbowButton_mesh", { width: 0.4, height: 0.1, depth: 0.1 }, this._gameScene);
        this._mesh.material = this._material;
        this._mesh.position.y = height;

        this._button = Button.CreateSimpleButton("rainbowButton_button", "");
        this._button.widthInPixels = this._gameScene.getEngine().getRenderWidth() * 0.8;
        this._button.heightInPixels = this._gameScene.getEngine().getRenderHeight() * 0.1;
        this._button.thickness = 0;
        this._gameScene.guiTexture.addControl(this._button);
        this._button.linkWithMesh(this._mesh);

        this.onClickedObservable = new Observable<void>();

        this._button.onPointerDownObservable.add(() => {
            this._gameScene.onBeforeRenderObservable.runCoroutineAsync(this.spinAnimationCoroutine());
            this.onClickedObservable.notifyObservers();
        });
    }

    private *spinAnimationCoroutine() {
        for (let t = 0; this._gameScene.State === GameSceneState.Raining && t <= 1; t += 1 / 20) {
            this._mesh.rotation.x = Math.pow(1 - t, 1.4) * 4;
            const scale = 1 - 0.15 * (0.5 - Math.abs(t - 0.5));
            this._mesh.scaling.set(scale, scale, scale);
            yield;
        }

        this._mesh.rotation.x = 0;
        this._mesh.scaling.set(1, 1, 1);
    }
}
