import * as BABYLON from "@babylonjs/core";

class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = BABYLON.Color4.FromInts(0, 0, 0, 255);

        var camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -10), scene);
        camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        const resizeOrthographicCamera = () => {
            camera.orthoTop = 10;
            camera.orthoBottom = 0;
            camera.orthoLeft = -camera.orthoTop * canvas.width / canvas.height / 2;
            camera.orthoRight = -camera.orthoLeft;
        };
        resizeOrthographicCamera();
        engine.onResizeObservable.add(resizeOrthographicCamera);

        var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        var sphere = BABYLON.Mesh.CreateSphere("sphere", 16, 2, scene);
        sphere.position.y = 1;

        return scene;
    }
}

export function CreatePlaygroundScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
    return Playground.CreateScene(engine, canvas);
}
