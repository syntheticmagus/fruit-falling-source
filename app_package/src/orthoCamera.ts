import { Camera, FreeCamera, Scene, Vector3 } from "@babylonjs/core";

export class OrthoCamera extends FreeCamera {
    constructor(scene: Scene) {
        super("camera", new Vector3(0, 0, -10), scene);
        const engine = scene.getEngine();
        this.mode = Camera.ORTHOGRAPHIC_CAMERA;
        const resizeOrthographicCamera = () => {
            this.orthoTop = 1;
            this.orthoBottom = 0;
            this.orthoLeft = -this.orthoTop * engine.getRenderWidth() / engine.getRenderHeight() / 2;
            this.orthoRight = -this.orthoLeft;
        };
        resizeOrthographicCamera();
        engine.onResizeObservable.add(resizeOrthographicCamera);
    }
}
