import { Color3, Color4, Engine, Material, MeshBuilder, Observable, PBRMaterial, Scene, SpotLight, SpriteManager, StandardMaterial, Texture, Tools, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Container, Grid, Image, StackPanel, TextBlock } from "@babylonjs/gui";
import { Drop } from "./drop";
import { OrthoCamera } from "./orthoCamera";
import { RainbowButton } from "./rainbowButton";
import { ResourceManifest } from "./ResourceManifest";

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
    private _resourceManifest: ResourceManifest;

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

    constructor (engine: Engine, resourceManifest: ResourceManifest) {
        super(engine);
        this._resourceManifest = resourceManifest;

        this._state = GameSceneState.Raining;
        this._camera = new OrthoCamera(this);
        this.clearColor = new Color4(0, 0, 0, 1);
        this.guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("gui", true, this);

        const grid = new Grid("grid");
        grid.addColumnDefinition(0.5);
        grid.addColumnDefinition(320, true);
        grid.addColumnDefinition(0.5);
        grid.addRowDefinition(0.12);
        grid.addRowDefinition(0.88);
        this.guiTexture.addControl(grid);

        const backgroundTexture = new Texture(this._resourceManifest.backgroundGameUrl, this, true);
        const background = MeshBuilder.CreatePlane("", {width: 9 / 16, height: 1}, this);
        const backgroundMaterial = new PBRMaterial("background_material", this);
        backgroundMaterial.unlit = true;
        backgroundMaterial.albedoTexture = backgroundTexture;
        background.material = backgroundMaterial;
        background.position.y = 0.5;
        background.position.z = 1;

        const colors = [
            new Color3(1.0, 0.0, 0.0),
            new Color3(1.0, 0.3, 0.0),
            new Color3(1.0, 1.0, 0.0),
            new Color3(0.1, 0.75, 0.0),
            new Color3(0.0, 0.0, 1.0),
            new Color3(1.0, 0.0, 1.0)
        ];
        this._buttons = new Array<RainbowButton>(colors.length);
        const frameSpriteManager = new SpriteManager("", this._resourceManifest.spritesheetButtonFrameUrl, 6, {width: 700, height: 180}, this);
        const faceSpriteManager = new SpriteManager("", this._resourceManifest.spritesheetMouthUrl, 6, {width: 456, height: 171}, this);
        const fruitSpriteManager = new SpriteManager("", this._resourceManifest.spritesheetFruitUrl, 15, {width: 120, height: 160}, this);

        for (let idx = 0; idx < colors.length; ++idx) {
            const height = 0.12 * (idx + 1);
            this._buttons[idx] = new RainbowButton(this, frameSpriteManager, faceSpriteManager, colors[idx], height);
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
        this._livesText.color = "#FF8888FF";
        this._livesText.fontStyle = "bold";
        this._livesText.fontFamily = "Courier";
        this._livesText.fontSize = "30";
        this._livesText.resizeToFit = true;
        this._livesText.outlineColor = "#000000FF";
        this._livesText.outlineWidth = 6;
        this._livesText.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
        this._livesText.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_RIGHT;
        this._livesText.isVisible = false;
        grid.addControl(this._livesText, 1, 1);

        this.failures = 0;

        this._score = 0;
        this._scoreText = new TextBlock("score", "");
        this._scoreText.color = "#FFFFFFFF";
        this._scoreText.fontStyle = "bold";
        this._scoreText.fontFamily = "Courier";
        this._scoreText.fontSize = "30";
        this._scoreText.resizeToFit = true;
        this._scoreText.outlineColor = "#000000FF";
        this._scoreText.outlineWidth = 6;
        this._scoreText.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
        this._scoreText.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
        this._scoreText.isVisible = false;
        grid.addControl(this._scoreText, 1, 1);
        this.score = 0;

        this.gameEndedObservable = new Observable<void>();

        this.onBeforeRenderObservable.runCoroutineAsync(this._runLightSystem());
        this.onBeforeRenderObservable.runCoroutineAsync(this._rainDropsCoroutine(fruitSpriteManager));
    }

    private *_rainDropsCoroutine(fruitSpriteManager: SpriteManager) {

        const countdownTextBlock = new TextBlock("countdown");
        countdownTextBlock.color = "#FFFFFFFF";
        countdownTextBlock.fontStyle = "bold";
        countdownTextBlock.fontFamily = "Courier";
        countdownTextBlock.fontSize = "64";
        countdownTextBlock.outlineColor = "#000000FF";
        countdownTextBlock.outlineWidth = 6;
        countdownTextBlock.height = "200px";
        countdownTextBlock.width = "200px";
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
        
        this._livesText.isVisible = true;
        this._scoreText.isVisible = true;

        yield Tools.DelayAsync(500);

        while (this._state === GameSceneState.Raining) {
            let drop: Drop;
            if (this._inactiveDrops.size > 0) {
                drop = this._inactiveDrops.values().next().value;
                this._inactiveDrops.delete(drop);
                this._activeDrops.add(drop);
            } else {
                drop = new Drop(this, fruitSpriteManager);
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
                    this._buttons[color].chompAndSmile();
                    return;
                } else {
                    this.failures += 1;
                    this._buttons[color].chompAndBleh();
                    return;
                }
            }
        });
        this._buttons[color].chomp();
    }

    private _endGame() {
        this._state = GameSceneState.Ending;

        this.guiTexture.dispose();

        this.guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("gui", true, this);

        const outerGrid = new Grid("grid");
        outerGrid.addColumnDefinition(1);
        outerGrid.addRowDefinition(0.55);
        outerGrid.addRowDefinition(0.35);
        outerGrid.addRowDefinition(0.1);
        outerGrid.background = "#AA7755A0";
        this.guiTexture.addControl(outerGrid);

        const gameOverContainer = new Container("gameOver");
        gameOverContainer.width = "300px";
        gameOverContainer.height = "150px";
        outerGrid.addControl(gameOverContainer, 0, 0);
        
        const gameOverImage = new Image("gameOver", this._resourceManifest.imageGameOverUrl);
        gameOverContainer.addControl(gameOverImage);

        const gameOverGrid = new Grid("gameOverGrid");
        gameOverGrid.addColumnDefinition(1);
        gameOverGrid.addRowDefinition(0.5);
        gameOverGrid.addRowDefinition(0.5);
        gameOverContainer.addControl(gameOverGrid);

        const finalScoreTextBlock = new TextBlock("finalScore", "Your Score: " + this.score);
        finalScoreTextBlock.color = "#FFFFFFFF";
        finalScoreTextBlock.fontStyle = "bold";
        finalScoreTextBlock.fontFamily = "Courier";
        finalScoreTextBlock.fontSize = "24";
        finalScoreTextBlock.outlineColor = "#000000FF";
        finalScoreTextBlock.outlineWidth = 5;
        finalScoreTextBlock.height = "80px";
        finalScoreTextBlock.width = "300px";
        gameOverGrid.addControl(finalScoreTextBlock, 1, 0);

        const buttonsStackPanel = new StackPanel("stackPanel");
        outerGrid.addControl(buttonsStackPanel, 1, 0);

        const playButton = Button.CreateImageWithCenterTextButton("play", "Play Again", this._resourceManifest.buttonPlankUrl);
        playButton.width = "240px";
        playButton.height = "80px";
        playButton.thickness = 0;
        playButton.textBlock!.color = "#FFFFFFFF";
        playButton.textBlock!.fontStyle = "bold";
        playButton.textBlock!.fontFamily = "Courier";
        playButton.textBlock!.fontSize = "22";
        playButton.textBlock!.outlineWidth = 6;
        playButton.textBlock!.outlineColor = "#000000FF";
        playButton.pointerEnterAnimation = () => {
            playButton.textBlock!.outlineColor = "#777777FF";
        };
        playButton.pointerOutAnimation = () => {
            playButton.textBlock!.outlineColor = "#000000FF";
        };
        playButton.onPointerClickObservable.add(() => {
            this.gameEndedObservable.notifyObservers();
        });
        buttonsStackPanel.addControl(playButton);
    }
}
