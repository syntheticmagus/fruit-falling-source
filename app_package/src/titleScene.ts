import { Color4, Engine, MeshBuilder, Observable, PBRMaterial, Scene, Texture } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Grid, StackPanel } from "@babylonjs/gui";
import { OrthoCamera } from "./orthoCamera";
import { ResourceManifest } from "./ResourceManifest";

export class TitleScene extends Scene {
    public readonly gameStartedObservable: Observable<void> = new Observable<void>();

    constructor (engine: Engine, resourceManifest: ResourceManifest) {
        super(engine);

        new OrthoCamera(this);
        this.clearColor = new Color4(0, 0, 0, 1);

        const backgroundTexture = new Texture(resourceManifest.backgroundTitleUrl, this, true);
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
        grid.addControl(stackPanel, 1, 1);
        
        const playButton = Button.CreateImageWithCenterTextButton("play", "Play", resourceManifest.buttonPlankUrl);
        playButton.thickness = 0;
        playButton.textBlock!.color = "#FFFFFFFF";
        playButton.textBlock!.fontStyle = "bold";
        playButton.textBlock!.fontFamily = "Courier";
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

        const handleResize = (engine: Engine) => {
            const height = engine.getRenderHeight();
            const width = height * 9 / 16;
            const REFERENCE_WIDTH = 320;
            const factor = width / REFERENCE_WIDTH;

            playButton.widthInPixels = 240 * factor;
            playButton.heightInPixels = 80 * factor;
            playButton.textBlock!.fontSize = Math.round(24 * factor);
            playButton.textBlock!.outlineWidth = Math.round(6 * factor);
        };
        handleResize(engine);
        const resizeObservable = engine.onResizeObservable.add(handleResize);
        this.onDisposeObservable.addOnce(() => {
            engine.onResizeObservable.remove(resizeObservable);
        });
    }
}
