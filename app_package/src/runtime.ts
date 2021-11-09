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
    let scene: Scene = new TitleScene(engine, options);
    const gameRestartHandler = () => {
        scene.dispose();
        scene = new GameScene(engine, options);
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
