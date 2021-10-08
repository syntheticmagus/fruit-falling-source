import { Color4, Engine, Observable, Scene } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Container, StackPanel, TextBlock } from "@babylonjs/gui";
import { OrthoCamera } from "./orthoCamera";

export class TitleScene extends Scene {
    public readonly gameStartedObservable: Observable<void> = new Observable<void>();

    constructor (engine: Engine) {
        super(engine);
        new OrthoCamera(this);
        this.clearColor = new Color4(0, 0, 0, 1);

        const guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("gui", true, this);

        const stackPanel = new StackPanel("titleUIStack");
        guiTexture.addControl(stackPanel);
        
        const titleTextBlock = new TextBlock("title", "Rainbow\nDrop");
        titleTextBlock.color = "#FF0000FF";
        titleTextBlock.fontStyle = "bold";
        titleTextBlock.fontFamily = "Courier";
        titleTextBlock.fontSize = "48";
        titleTextBlock.resizeToFit = true;
        stackPanel.addControl(titleTextBlock);
        
        const playButton = Button.CreateSimpleButton("playAgain", "Play");
        playButton.width = "120px";
        playButton.height = "40px";
        playButton.background = "#00FF00FF";
        playButton.textBlock!.color = "#FFFFFFFF";
        playButton.textBlock!.fontStyle = "bold";
        playButton.textBlock!.fontFamily = "Courier";
        playButton.textBlock!.fontSize = "18";
        playButton.verticalAlignment = Button.VERTICAL_ALIGNMENT_BOTTOM;
        playButton.onPointerClickObservable.add(() => {
            this.gameStartedObservable.notifyObservers();
        });
        guiTexture.addControl(playButton);
    }
}