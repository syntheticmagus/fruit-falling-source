import { Color3, Color4, Engine, Material, Observable, Scene, SpotLight, StandardMaterial, Tools, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Container, StackPanel, TextBlock } from "@babylonjs/gui";
import { Drop } from "./drop";
import { OrthoCamera } from "./orthoCamera";
import { RainbowButton } from "./rainbowButton";

export enum GameSceneState {
    Raining,
    Ending
};

export enum GameButtonColors {
    Red = 0,
    Orange = 1,
    Yellow = 2,
    Green = 3,
    Blue = 4,
    Purple = 5
}

export class GameScene extends Scene {
    private _state: GameSceneState;
    private _camera: OrthoCamera;
    private _buttons: Array<RainbowButton>;
    private _activeDrops: Set<Drop>;
    private _inactiveDrops: Set<Drop>;
    private _failures: number;
    private _score: number;
    private _livesText: TextBlock;
    private _scoreText: TextBlock;

    private get failures(): number {
        return this._failures;
    }

    private set failures(value: number) {
        const MAX_FAILURES = 3;
        this._failures = value;
        this._livesText.text = "♥:" + (MAX_FAILURES - this._failures);
        if (this._failures >= MAX_FAILURES) {
            this._endGame();
        }
    }

    private get score() {
        return this._score;
    }

    private set score(value: number) {
        this._score = value;
        this._scoreText.text = "Score:" + this._score;
    }

    public guiTexture: AdvancedDynamicTexture;
    public dropMaterials: Array<Material>;
    public gameEndedObservable: Observable<void>;

    public get State() {
        return this._state;
    }

    constructor (engine: Engine) {
        super(engine);
        this._state = GameSceneState.Raining;
        this._camera = new OrthoCamera(this);
        this.clearColor = new Color4(0, 0, 0, 1);
        this.guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("gui", true, this);

        const colors = [
            new Color3(1.0, 0.0, 0.0),
            new Color3(1.0, 0.5, 0.0),
            new Color3(1.0, 1.0, 0.0),
            new Color3(0.0, 1.0, 0.0),
            new Color3(0.0, 0.0, 1.0),
            new Color3(1.0, 0.0, 1.0)
        ];
        this._buttons = new Array<RainbowButton>(colors.length);
        for (let idx = 0; idx < colors.length; ++idx) {
            const height = 0.12 * (idx + 1);
            this._buttons[idx] = new RainbowButton(this, colors[idx], height);
            this._buttons[idx].onClickedObservable.add(() => {
                this._handleButtonPressed(height, idx);
            });
        }

        this.dropMaterials = new Array<Material>(colors.length);
        for (let idx = 0; idx < colors.length; ++idx) {
            const mat = new StandardMaterial("colored_material", this);
            mat.diffuseColor = colors[idx];
            mat.specularPower = 1000;
            this.dropMaterials[idx] = mat;
        }

        this._activeDrops = new Set<Drop>();
        this._inactiveDrops = new Set<Drop>();
        this._failures = 0;

        this._livesText = new TextBlock("lives", "");
        this._livesText.color = "#FF0000FF";
        this._livesText.fontStyle = "bold";
        this._livesText.fontFamily = "Courier";
        this._livesText.fontSize = "30";
        this._livesText.resizeToFit = true;
        this._livesText.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
        this._livesText.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_RIGHT;
        this.guiTexture.addControl(this._livesText);

        this.failures = 0;

        this._score = 0;
        this._scoreText = new TextBlock("score", "");
        this._scoreText.color = "#0000FFFF";
        this._scoreText.fontStyle = "bold";
        this._scoreText.fontFamily = "Courier";
        this._scoreText.fontSize = "30";
        this._scoreText.resizeToFit = true;
        this._scoreText.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
        this._scoreText.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
        this.guiTexture.addControl(this._scoreText);
        this.score = 0;

        this.gameEndedObservable = new Observable<void>();

        this.onBeforeRenderObservable.runCoroutineAsync(this._runLightSystem());
        this.onBeforeRenderObservable.runCoroutineAsync(this._rainDropsCoroutine());
    }

    private *_rainDropsCoroutine() {
        const countdownTextBlock = new TextBlock("countdown");
        countdownTextBlock.color = "#FF0000FF";
        countdownTextBlock.fontStyle = "bold";
        countdownTextBlock.fontFamily = "Courier";
        countdownTextBlock.fontSize = "64";
        countdownTextBlock.resizeToFit = true;
        countdownTextBlock.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
        countdownTextBlock.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;
        this.guiTexture.addControl(countdownTextBlock);
        countdownTextBlock.text = "3";
        yield Tools.DelayAsync(1000);
        countdownTextBlock.text = "2";
        yield Tools.DelayAsync(1000);
        countdownTextBlock.text = "1";
        yield Tools.DelayAsync(1000);
        countdownTextBlock.text = "Go!";
        Tools.DelayAsync(1000).then(() => {
            this.guiTexture.removeControl(countdownTextBlock);
            countdownTextBlock.dispose();
        });

        while (this._state === GameSceneState.Raining) {
            let drop: Drop;
            if (this._inactiveDrops.size > 0) {
                drop = this._inactiveDrops.values().next().value;
                this._inactiveDrops.delete(drop);
                this._activeDrops.add(drop);
            } else {
                drop = new Drop(this);
                drop.onFinishedFallingObservable.add(() => {
                    this.failures += 1;
                });
            }
            this._activeDrops.add(drop);
            drop.fallAsync().then(() => {
                this._activeDrops.delete(drop);
                this._inactiveDrops.add(drop);
            });
            yield Tools.DelayAsync(1000);
        }
    }

    private *_runLightSystem() {
        const setLightDirection = (light: SpotLight) => {
            light.direction.copyFrom(light.position);
            light.direction.negateInPlace();
            light.direction.z += 5;
            light.direction.normalize();
        }
        const light = new SpotLight("light", new Vector3(-3, 3, -5), Vector3.Down(), Math.PI, 1, this);
        light.diffuse = new Color3(1.0, 1.0, 1.0);
        
        const TIME_SCALE = 1;
        let t = 0;
        while (this._state === GameSceneState.Raining) { 
            t += (TIME_SCALE / (60 * this.getAnimationRatio()));
            light.position.x = 3 * Math.sin(t);
            light.position.y = 3 * Math.sin(-t) + 1;
            setLightDirection(light);
            yield;
        }
    }

    private _handleButtonPressed(height: number, color: GameButtonColors) {
        this._activeDrops.forEach((drop) => {
            if (Math.abs(drop.position.y - height) < 0.05) {
                drop.Caught = true;
                if (color === drop.Color) {
                    this.score += 1;
                } else {
                    this.failures += 1;
                }
            }
        });
    }

    private _endGame() {
        this._state = GameSceneState.Ending;

        this.guiTexture.dispose();

        this.guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("gui", true, this);

        const modalContainer = new Container("modal");
        modalContainer.background = "#FFFFFFA0";
        modalContainer.width = "100%";
        modalContainer.height = "100%";
        this.guiTexture.addControl(modalContainer);

        const stackPanel = new StackPanel("endUIStack");
        this.guiTexture.addControl(stackPanel);
        
        const gameOverTextBlock = new TextBlock("gameOver", "Game Over");
        gameOverTextBlock.color = "#FF0000FF";
        gameOverTextBlock.fontStyle = "bold";
        gameOverTextBlock.fontFamily = "Courier";
        gameOverTextBlock.fontSize = "48";
        gameOverTextBlock.resizeToFit = true;
        stackPanel.addControl(gameOverTextBlock);

        const finalScoreTextBlock = new TextBlock("finalScore", "Your Score: " + this.score);
        finalScoreTextBlock.color = "#0000FFFF";
        finalScoreTextBlock.fontStyle = "bold";
        finalScoreTextBlock.fontFamily = "Courier";
        finalScoreTextBlock.fontSize = "24";
        finalScoreTextBlock.resizeToFit = true;
        stackPanel.addControl(finalScoreTextBlock);
        
        const replayButton = Button.CreateSimpleButton("playAgain", "Play Again");
        replayButton.width = "120px";
        replayButton.height = "40px";
        replayButton.background = "#00FF00FF";
        replayButton.textBlock!.color = "#FFFFFFFF";
        replayButton.textBlock!.fontStyle = "bold";
        replayButton.textBlock!.fontFamily = "Courier";
        replayButton.textBlock!.fontSize = "18";
        replayButton.verticalAlignment = Button.VERTICAL_ALIGNMENT_BOTTOM;
        replayButton.onPointerClickObservable.add(() => {
            this.gameEndedObservable.notifyObservers();
        });
        this.guiTexture.addControl(replayButton);
    }
}
