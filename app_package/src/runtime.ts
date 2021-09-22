import { Engine } from "@babylonjs/core";
import { GameScene } from "./gameScene";

export interface InitializeBabylonAppOptions {
    canvas: HTMLCanvasElement;
    resourceManifest?: Map<string, string>;
}

export function initializeBabylonApp(options: InitializeBabylonAppOptions) {
    const canvas = options.canvas;
    const engine = new Engine(canvas);
    let scene = new GameScene(engine);
    const gameEndedHandler = () => {
        scene.dispose();
        scene = new GameScene(engine);
        scene.gameEndedObservable.add(gameEndedHandler);
    };
    scene.gameEndedObservable.add(gameEndedHandler);
    engine.runRenderLoop(() => {
        scene.render();
    });
    window.addEventListener("resize", () => {
        engine.resize();
    });
}

