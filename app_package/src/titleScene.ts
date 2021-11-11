import { Color4, Engine, MeshBuilder, Observable, PBRMaterial, Scene, Texture } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Grid, StackPanel, TextBlock } from "@babylonjs/gui";
import { GameOptions } from "./gameOptions";
import { OrthoCamera } from "./orthoCamera";
import { ResourceManifest } from "./ResourceManifest";

const CREDITS: string = 
`Game by syntheticmagus

Powered by Babylon.js
`;

export class TitleScene extends Scene {
    public readonly gameStartedObservable: Observable<void> = new Observable<void>();

    constructor (engine: Engine, resourceManifest: ResourceManifest, gameOptions: GameOptions) {
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
        grid.addRowDefinition(0.6);
        grid.addRowDefinition(0.4);
        grid.addRowDefinition(0);
        grid.addRowDefinition(0);
        guiTexture.addControl(grid);

        const shrinkAndGrowRowsCoroutine = function* (shrinkRow: number, growRow: number) {
            let shift;
            const FRAMES = 15;
            for (let idx = 0; idx <= FRAMES; ++idx) {
                shift = 0.4 * idx / FRAMES;
                grid.setRowDefinition(0, 0.6 + shift);
                grid.setRowDefinition(shrinkRow, 0.4 - shift);
                yield;
            }
            yield;
            yield;
            yield;
            yield;
            for (let idx = 0; idx <= FRAMES; ++idx) {
                shift = 0.4 * idx / FRAMES;
                grid.setRowDefinition(0, 1 - shift);
                grid.setRowDefinition(growRow, shift);
                yield;
            }
        };

        const mainStackPanel = new StackPanel("mainStackPanel");
        mainStackPanel.verticalAlignment = StackPanel.VERTICAL_ALIGNMENT_TOP;
        grid.addControl(mainStackPanel, 1, 0);
        
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
        mainStackPanel.addControl(playButton);

        const optionsButton = Button.CreateImageWithCenterTextButton("options", "Options", resourceManifest.buttonPlankUrl);
        optionsButton.thickness = 0;
        optionsButton.textBlock!.color = "#FFFFFFFF";
        optionsButton.textBlock!.fontStyle = "bold";
        optionsButton.textBlock!.fontFamily = "Courier";
        optionsButton.textBlock!.outlineWidth = 6;
        optionsButton.textBlock!.outlineColor = "#000000FF";
        optionsButton.pointerEnterAnimation = () => {
            optionsButton.textBlock!.outlineColor = "#777777FF";
        };
        optionsButton.pointerOutAnimation = () => {
            optionsButton.textBlock!.outlineColor = "#000000FF";
        };
        optionsButton.onPointerClickObservable.add(() => {
            this.onBeforeRenderObservable.runCoroutineAsync(shrinkAndGrowRowsCoroutine(1, 2));
        });
        mainStackPanel.addControl(optionsButton);

        const creditsButton = Button.CreateImageWithCenterTextButton("credits", "Credits", resourceManifest.buttonPlankUrl);
        creditsButton.thickness = 0;
        creditsButton.textBlock!.color = "#FFFFFFFF";
        creditsButton.textBlock!.fontStyle = "bold";
        creditsButton.textBlock!.fontFamily = "Courier";
        creditsButton.textBlock!.outlineWidth = 6;
        creditsButton.textBlock!.outlineColor = "#000000FF";
        creditsButton.pointerEnterAnimation = () => {
            creditsButton.textBlock!.outlineColor = "#777777FF";
        };
        creditsButton.pointerOutAnimation = () => {
            creditsButton.textBlock!.outlineColor = "#000000FF";
        };
        creditsButton.onPointerClickObservable.add(() => {
            this.onBeforeRenderObservable.runCoroutineAsync(shrinkAndGrowRowsCoroutine(1, 3));
        });
        mainStackPanel.addControl(creditsButton);

        const optionsStackPanel = new StackPanel("optionsStackPanel");
        optionsStackPanel.verticalAlignment = StackPanel.VERTICAL_ALIGNMENT_TOP;
        grid.addControl(optionsStackPanel, 2, 0);
        
        const accessibilityButton = Button.CreateImageWithCenterTextButton("accessibility", "Shape Hints: " + (gameOptions.shapeHints ? "On" : "Off"), resourceManifest.buttonPlankUrl);
        accessibilityButton.thickness = 0;
        accessibilityButton.textBlock!.color = "#FFFFFFFF";
        accessibilityButton.textBlock!.fontStyle = "bold";
        accessibilityButton.textBlock!.fontFamily = "Courier";
        accessibilityButton.textBlock!.outlineWidth = 6;
        accessibilityButton.textBlock!.outlineColor = "#000000FF";
        accessibilityButton.pointerEnterAnimation = () => {
            accessibilityButton.textBlock!.outlineColor = "#777777FF";
        };
        accessibilityButton.pointerOutAnimation = () => {
            accessibilityButton.textBlock!.outlineColor = "#000000FF";
        };
        accessibilityButton.onPointerClickObservable.add(() => {
            gameOptions.shapeHints = !gameOptions.shapeHints;
            accessibilityButton.textBlock!.text = "Shape Hints: " + (gameOptions.shapeHints ? "On" : "Off");
        });
        optionsStackPanel.addControl(accessibilityButton);
        
        const difficultyButton = Button.CreateImageWithCenterTextButton("difficulty", "Drop Rate: " + (gameOptions.slowDropRate ? "Slow" : "Fast"), resourceManifest.buttonPlankUrl);
        difficultyButton.thickness = 0;
        difficultyButton.textBlock!.color = "#FFFFFFFF";
        difficultyButton.textBlock!.fontStyle = "bold";
        difficultyButton.textBlock!.fontFamily = "Courier";
        difficultyButton.textBlock!.outlineWidth = 6;
        difficultyButton.textBlock!.outlineColor = "#000000FF";
        difficultyButton.pointerEnterAnimation = () => {
            difficultyButton.textBlock!.outlineColor = "#777777FF";
        };
        difficultyButton.pointerOutAnimation = () => {
            difficultyButton.textBlock!.outlineColor = "#000000FF";
        };
        difficultyButton.onPointerClickObservable.add(() => {
            gameOptions.slowDropRate = !gameOptions.slowDropRate;
            difficultyButton.textBlock!.text = "Drop Rate: " + (gameOptions.slowDropRate ? "Slow" : "Fast");
        });
        optionsStackPanel.addControl(difficultyButton);

        const backButton = Button.CreateImageWithCenterTextButton("back", "Back", resourceManifest.buttonPlankUrl);
        backButton.thickness = 0;
        backButton.textBlock!.color = "#FFFFFFFF";
        backButton.textBlock!.fontStyle = "bold";
        backButton.textBlock!.fontFamily = "Courier";
        backButton.textBlock!.outlineWidth = 6;
        backButton.textBlock!.outlineColor = "#000000FF";
        backButton.pointerEnterAnimation = () => {
            backButton.textBlock!.outlineColor = "#777777FF";
        };
        backButton.pointerOutAnimation = () => {
            backButton.textBlock!.outlineColor = "#000000FF";
        };
        backButton.onPointerClickObservable.add(() => {
            this.onBeforeRenderObservable.runCoroutineAsync(shrinkAndGrowRowsCoroutine(2, 1));
        });
        optionsStackPanel.addControl(backButton);

        const creditsStackPanel = new StackPanel("creditsStackPanel");
        creditsStackPanel.verticalAlignment = StackPanel.VERTICAL_ALIGNMENT_TOP;
        grid.addControl(creditsStackPanel, 3, 0);

        const creditsText = new TextBlock("creditsText", CREDITS);
        creditsText.color = "#FFFFFFFF";
        creditsText.fontStyle = "bold";
        creditsText.fontFamily = "Courier";
        creditsText.outlineWidth = 6;
        creditsText.outlineColor = "#000000FF";
        creditsText.textWrapping = true;
        creditsText.resizeToFit = true;
        creditsStackPanel.addControl(creditsText);

        const creditsBackButton = Button.CreateImageWithCenterTextButton("creditsBack", "Back", resourceManifest.buttonPlankUrl);
        creditsBackButton.thickness = 0;
        creditsBackButton.textBlock!.color = "#FFFFFFFF";
        creditsBackButton.textBlock!.fontStyle = "bold";
        creditsBackButton.textBlock!.fontFamily = "Courier";
        creditsBackButton.textBlock!.outlineWidth = 6;
        creditsBackButton.textBlock!.outlineColor = "#000000FF";
        creditsBackButton.pointerEnterAnimation = () => {
            creditsBackButton.textBlock!.outlineColor = "#777777FF";
        };
        creditsBackButton.pointerOutAnimation = () => {
            creditsBackButton.textBlock!.outlineColor = "#000000FF";
        };
        creditsBackButton.onPointerClickObservable.add(() => {
            this.onBeforeRenderObservable.runCoroutineAsync(shrinkAndGrowRowsCoroutine(3, 1));
        });
        creditsStackPanel.addControl(creditsBackButton);

        const handleResize = (engine: Engine) => {
            const height = engine.getRenderHeight();
            const width = height * 9 / 16;
            const REFERENCE_WIDTH = 320;
            const factor = width / REFERENCE_WIDTH;

            playButton.widthInPixels = 240 * factor;
            playButton.heightInPixels = 60 * factor;
            playButton.textBlock!.fontSize = Math.round(24 * factor);
            playButton.textBlock!.outlineWidth = Math.round(6 * factor);
            
            optionsButton.widthInPixels = 200 * factor;
            optionsButton.heightInPixels = 50 * factor;
            optionsButton.textBlock!.fontSize = Math.round(20 * factor);
            optionsButton.textBlock!.outlineWidth = Math.round(5 * factor);
            
            creditsButton.widthInPixels = 200 * factor;
            creditsButton.heightInPixels = 50 * factor;
            creditsButton.textBlock!.fontSize = Math.round(20 * factor);
            creditsButton.textBlock!.outlineWidth = Math.round(5 * factor);

            accessibilityButton.widthInPixels = 200 * factor;
            accessibilityButton.heightInPixels = 50 * factor;
            accessibilityButton.textBlock!.fontSize = Math.round(15 * factor);
            accessibilityButton.textBlock!.outlineWidth = Math.round(5 * factor);

            difficultyButton.widthInPixels = 200 * factor;
            difficultyButton.heightInPixels = 50 * factor;
            difficultyButton.textBlock!.fontSize = Math.round(15 * factor);
            difficultyButton.textBlock!.outlineWidth = Math.round(5 * factor);
            
            backButton.widthInPixels = 200 * factor;
            backButton.heightInPixels = 50 * factor;
            backButton.textBlock!.fontSize = Math.round(18 * factor);
            backButton.textBlock!.outlineWidth = Math.round(5 * factor);

            creditsText.fontSizeInPixels = Math.round(18 * factor);
            creditsText.outlineWidth = Math.round(5 * factor);

            creditsBackButton.widthInPixels = 200 * factor;
            creditsBackButton.heightInPixels = 50 * factor;
            creditsBackButton.textBlock!.fontSize = Math.round(18 * factor);
            creditsBackButton.textBlock!.outlineWidth = Math.round(5 * factor);
        };
        handleResize(engine);
        const resizeObservable = engine.onResizeObservable.add(handleResize);
        this.onDisposeObservable.addOnce(() => {
            engine.onResizeObservable.remove(resizeObservable);
        });
    }
}
