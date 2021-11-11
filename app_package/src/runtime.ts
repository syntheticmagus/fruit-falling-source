import { Engine, Scene } from "@babylonjs/core";
import { GameScene } from "./gameScene";
import { ResourceManifest } from "./ResourceManifest";
import { TitleScene } from "./titleScene";

export interface InitializeBabylonAppOptions extends ResourceManifest {
    canvas: HTMLCanvasElement;
}

export function initializeBabylonApp(options: InitializeBabylonAppOptions) {
    const canvas = options.canvas;
    const engine = new Engine(canvas);
    const gameOptions = {
        shapeHints: false,   // TODO: Store and load these settings
        slowDropRate: true  // TODO: Store and load these settings
    };

    let scene: Scene;
    let createTitleScene: () => void;
    let createGameScene: () => void;
    createTitleScene = () => {
        scene?.dispose();
        scene = new TitleScene(engine, options, gameOptions);
        (scene as TitleScene).gameStartedObservable.add(createGameScene);
    }
    createGameScene = () => {
        scene?.dispose();
        scene = new GameScene(engine, options, gameOptions);
        (scene as GameScene).restartGameObservable.add(createGameScene);
        (scene as GameScene).exitGameObservable.add(createTitleScene);
    };

    createTitleScene();
    engine.runRenderLoop(() => {
        scene.render();
    });
    window.addEventListener("resize", () => {
        engine.resize(true);
    });
}
