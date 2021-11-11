import { Nullable, Observable, Observer, Scene } from "@babylonjs/core";

export class FixedFramerateObservable extends Observable<number> {
    private _scene;
    private _updateObserver: Nullable<Observer<Scene>>;
    private readonly _millisPerFrame: number;
    private _millisSinceLastFrame: number;
    private _frame: number

    public constructor(scene: Scene, framesPerSecond: number) {
        super();

        this._scene = scene;
        this._updateObserver = this._scene.onBeforeRenderObservable.add(() => {
            this._update();
        });
        this._millisPerFrame = 1000 / framesPerSecond;
        this._millisSinceLastFrame = this._millisPerFrame;
        this._frame = 0;
    }

    public dispose() {
        this._scene.onBeforeRenderObservable.remove(this._updateObserver);
    }

    private _update() {
        this._millisSinceLastFrame += this._scene.getEngine().getDeltaTime();

        while (this._millisSinceLastFrame >= this._millisPerFrame) {
            this.notifyObservers(this._frame);
            this._frame += 1;
            this._millisSinceLastFrame -= this._millisPerFrame;
        }
    }
}