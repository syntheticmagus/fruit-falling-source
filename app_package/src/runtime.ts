import { Engine, Scene } from "@babylonjs/core";
import { GameScene } from "./gameScene";
import { TitleScene } from "./titleScene";

export interface InitializeBabylonAppOptions {
    canvas: HTMLCanvasElement;
    resourceManifest?: Map<string, string>;
}

export function initializeBabylonApp(options: InitializeBabylonAppOptions) {
    const canvas = options.canvas;
    const engine = new Engine(canvas);
    let scene: Scene = new TitleScene(engine);
    const gameRestartHandler = () => {
        scene.dispose();
        scene = new GameScene(engine);
        (scene as GameScene).gameEndedObservable.add(gameRestartHandler);
    };
    (scene as TitleScene).gameStartedObservable.add(gameRestartHandler);
    engine.runRenderLoop(() => {
        scene.render();
    });
    window.addEventListener("resize", () => {
        engine.resize();
    });
}
