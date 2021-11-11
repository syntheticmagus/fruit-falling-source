import { Color3, Color4, Engine, Material, MeshBuilder, Nullable, Observable, Observer, PBRMaterial, Scene, SpotLight, Sprite, SpriteManager, StandardMaterial, Texture, Tools, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Container, Grid, Image, StackPanel, TextBlock } from "@babylonjs/gui";
import { Drop } from "./drop";
import { GameOptions } from "./gameOptions";
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
    private _resourceManifest: ResourceManifest;
    private _gameOptions: GameOptions;
    private _state: GameSceneState;
    private _camera: OrthoCamera;
    private _buttons: Array<RainbowButton>;
    private _activeDrops: Set<Drop>;
    private _inactiveDrops: Set<Drop>;
    private _failures: number;
    private _score: number;
    private _livesText: TextBlock;
    private _scoreText: TextBlock;
    private _countdownText: TextBlock;
    private _resizeObserverDisposeObserver: Nullable<Observer<Scene>>;

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
    public restartGameObservable: Observable<void>;
    public exitGameObservable: Observable<void>;

    public get State() {
        return this._state;
    }

    constructor (engine: Engine, resourceManifest: ResourceManifest, gameOptions: GameOptions) {
        super(engine);
        this._resourceManifest = resourceManifest;
        this._gameOptions = gameOptions;

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
        
        this._livesText = new TextBlock("lives", "");
        this._livesText.color = "#FF8888FF";
        this._livesText.fontStyle = "bold";
        this._livesText.fontFamily = "Courier";
        this._livesText.resizeToFit = true;
        this._livesText.outlineColor = "#000000FF";
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
        this._scoreText.resizeToFit = true;
        this._scoreText.outlineColor = "#000000FF";
        this._scoreText.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
        this._scoreText.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
        this._scoreText.isVisible = false;
        grid.addControl(this._scoreText, 1, 1);
        this.score = 0;
        
        this._countdownText = new TextBlock("countdown");
        this._countdownText.color = "#FFFFFFFF";
        this._countdownText.fontStyle = "bold";
        this._countdownText.fontFamily = "Courier";
        this._countdownText.outlineColor = "#000000FF";
        this._countdownText.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
        this._countdownText.verticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;
        this._countdownText.isVisible = false;
        this.guiTexture.addControl(this._countdownText);

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
        const fruitSpriteManager = new SpriteManager("", this._resourceManifest.spritesheetFruitUrl, 32, {width: 120, height: 160}, this);

        for (let idx = 0; idx < colors.length; ++idx) {
            const height = 0.12 * (idx + 1);
            this._buttons[idx] = new RainbowButton(this, frameSpriteManager, faceSpriteManager, colors[idx], height);
            this._buttons[idx].onClickedObservable.add(() => {
                this._handleButtonPressed(height, idx);
            });

            // Accessibility
            if (this._gameOptions.shapeHints) {
                let shapeHint = new Sprite("shapeHint", fruitSpriteManager);
                const cell = [1, 2, 0, 3, 4, 5][idx];
                shapeHint.width = 0.05;
                shapeHint.height = 0.07;
                shapeHint.position.x = -0.16;
                shapeHint.position.y = height;
                shapeHint.position.z = -0.1;
                shapeHint.cellIndex = cell;

                shapeHint = new Sprite("shapeHint", fruitSpriteManager);
                shapeHint.width = 0.05;
                shapeHint.height = 0.07;
                shapeHint.position.x = 0.16;
                shapeHint.position.y = height;
                shapeHint.position.z = -0.1;
                shapeHint.cellIndex = cell;
            }
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

        this.restartGameObservable = new Observable<void>();
        this.exitGameObservable = new Observable<void>();

        this.onBeforeRenderObservable.runCoroutineAsync(this._runLightSystem());
        this.onBeforeRenderObservable.runCoroutineAsync(this._rainDropsCoroutine(fruitSpriteManager));

        const handleResize = (engine: Engine) => {
            const height = engine.getRenderHeight();
            const width = height * 9 / 16;
            const REFERENCE_WIDTH = 320;
            const factor = width / REFERENCE_WIDTH;

            grid.setColumnDefinition(1, Math.round(280 * factor), true);
            this._livesText.fontSizeInPixels = Math.round(30 * factor);
            this._livesText.outlineWidth = Math.round(6 * factor);
            this._scoreText.fontSizeInPixels = Math.round(30 * factor);
            this._scoreText.outlineWidth = Math.round(6 * factor);
            this._countdownText.widthInPixels = Math.round(200 * factor);
            this._countdownText.heightInPixels = Math.round(200 * factor);
            this._countdownText.fontSize = Math.round(64 * factor);
            this._countdownText.outlineWidth = Math.round(6 * factor);
            this._buttons.forEach((button) => {
                button.resize();
            });
        };
        handleResize(engine);
        const resizeObserver = engine.onResizeObservable.add(handleResize);
        this._resizeObserverDisposeObserver = this.onDisposeObservable.addOnce(() => {
            engine.onResizeObservable.remove(resizeObserver);
        });
    }

    private *_rainDropsCoroutine(fruitSpriteManager: SpriteManager) {
        this._countdownText.isVisible = true;
        this._countdownText.text = "3";
        yield Tools.DelayAsync(1000);
        this._countdownText.text = "2";
        yield Tools.DelayAsync(1000);
        this._countdownText.text = "1";
        yield Tools.DelayAsync(1000);
        this._countdownText.text = "Go!";
        Tools.DelayAsync(1000).then(() => {
            this._countdownText.isVisible = false;
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
            yield Tools.DelayAsync(this._gameOptions.slowDropRate ? 1400 : 1000);
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

        this.onDisposeObservable.remove(this._resizeObserverDisposeObserver);
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
        playButton.thickness = 0;
        playButton.textBlock!.color = "#FFFFFFFF";
        playButton.textBlock!.fontStyle = "bold";
        playButton.textBlock!.fontFamily = "Courier";
        playButton.textBlock!.outlineColor = "#000000FF";
        playButton.pointerEnterAnimation = () => {
            playButton.textBlock!.outlineColor = "#777777FF";
        };
        playButton.pointerOutAnimation = () => {
            playButton.textBlock!.outlineColor = "#000000FF";
        };
        playButton.onPointerClickObservable.add(() => {
            this.restartGameObservable.notifyObservers();
        });
        buttonsStackPanel.addControl(playButton);

        const backButton = Button.CreateImageWithCenterTextButton("back", "Back to Title", this._resourceManifest.buttonPlankUrl);
        backButton.thickness = 0;
        backButton.textBlock!.color = "#FFFFFFFF";
        backButton.textBlock!.fontStyle = "bold";
        backButton.textBlock!.fontFamily = "Courier";
        backButton.textBlock!.outlineColor = "#000000FF";
        backButton.pointerEnterAnimation = () => {
            backButton.textBlock!.outlineColor = "#777777FF";
        };
        backButton.pointerOutAnimation = () => {
            backButton.textBlock!.outlineColor = "#000000FF";
        };
        backButton.onPointerClickObservable.add(() => {
            this.exitGameObservable.notifyObservers();
        });
        buttonsStackPanel.addControl(backButton);

        const engine = this.getEngine();
        const handleResize = (engine: Engine) => {
            const height = engine.getRenderHeight();
            const width = height * 9 / 16;
            const REFERENCE_WIDTH = 320;
            const factor = width / REFERENCE_WIDTH;

            gameOverContainer.widthInPixels = Math.round(300 * factor);
            gameOverContainer.heightInPixels = Math.round(150 * factor);
            
            finalScoreTextBlock.fontSizeInPixels = Math.round(24 * factor);
            finalScoreTextBlock.outlineWidth = Math.round(6 * factor);
            finalScoreTextBlock.widthInPixels = Math.round(300 * factor);
            finalScoreTextBlock.heightInPixels = Math.round(80 * factor);

            playButton.widthInPixels = Math.round(240 * factor);
            playButton.heightInPixels = Math.round(60 * factor);
            playButton.textBlock!.fontSizeInPixels = Math.round(24 * factor);
            playButton.textBlock!.outlineWidth = Math.round(6 * factor);
            
            backButton.widthInPixels = Math.round(200 * factor);
            backButton.heightInPixels = Math.round(50 * factor);
            backButton.textBlock!.fontSizeInPixels = Math.round(20 * factor);
            backButton.textBlock!.outlineWidth = Math.round(5 * factor);
        };
        handleResize(engine);
        const resizeObserver = engine.onResizeObservable.add(handleResize);
        this._resizeObserverDisposeObserver = this.onDisposeObservable.addOnce(() => {
            engine.onResizeObservable.remove(resizeObserver);
        });
    }
}
