import { Color4, Engine, MeshBuilder, Observable, PBRMaterial, Scene, Texture } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Grid, StackPanel } from "@babylonjs/gui";
import { OrthoCamera } from "./orthoCamera";

export class TitleScene extends Scene {
    public readonly gameStartedObservable: Observable<void> = new Observable<void>();

    constructor (engine: Engine) {
        super(engine);
        new OrthoCamera(this);
        this.clearColor = new Color4(0, 0, 0, 1);

        const backgroundTexture = new Texture("http://127.0.0.1:8181/fruit_falling_title.png", this, true);
        const background = MeshBuilder.CreatePlane("", {width: 9 / 16, height: 1}, this);
        const backgroundMaterial = new PBRMaterial("background_material", this);
        backgroundMaterial.unlit = true;
        backgroundMaterial.albedoTexture = backgroundTexture;
        background.material = backgroundMaterial;
        background.position.y = 0.5;
        background.position.z = 1;

        const guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("gui", true, this);

        const grid = new Grid("grid");
        grid.addColumnDefinition(1);
        grid.addRowDefinition(0.55);
        grid.addRowDefinition(0.35);
        grid.addRowDefinition(0.1);
        guiTexture.addControl(grid);

        const stackPanel = new StackPanel("stackPanel");
        grid.addControl(stackPanel, 1, 0);
        
        const playButton = Button.CreateImageWithCenterTextButton("play", "Play", "http://127.0.0.1:8181/fruit_falling_button.png");
        playButton.width = "240px";
        playButton.height = "80px";
        playButton.thickness = 0;
        playButton.textBlock!.color = "#FFFFFFFF";
        playButton.textBlock!.fontStyle = "bold";
        playButton.textBlock!.fontFamily = "Courier";
        playButton.textBlock!.fontSize = "32";
        playButton.textBlock!.outlineWidth = 6;
        playButton.textBlock!.outlineColor = "#000000FF";
        playButton.pointerEnterAnimation = () => {
            playButton.textBlock!.outlineColor = "#777777FF";
        };
        playButton.pointerOutAnimation = () => {
            playButton.textBlock!.outlineColor = "#000000FF";
        };
        playButton.onPointerClickObservable.add(() => {
            this.gameStartedObservable.notifyObservers();
        });
        stackPanel.addControl(playButton);
    }
}