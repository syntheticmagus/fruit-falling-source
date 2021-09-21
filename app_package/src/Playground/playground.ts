import { Camera, Color4, Engine, FreeCamera, HemisphericLight, Mesh, Scene, Vector3 } from "@babylonjs/core";

class Playground {
    public static CreateScene(engine: Engine, canvas: HTMLCanvasElement): Scene {
        var scene = new Scene(engine);
        scene.clearColor = Color4.FromInts(0, 0, 0, 255);

        var camera = new FreeCamera("camera", new Vector3(0, 0, -10), scene);
        camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
        const resizeOrthographicCamera = () => {
            camera.orthoTop = 10;
            camera.orthoBottom = 0;
            camera.orthoLeft = -camera.orthoTop * canvas.width / canvas.height / 2;
            camera.orthoRight = -camera.orthoLeft;
        };
        resizeOrthographicCamera();
        engine.onResizeObservable.add(resizeOrthographicCamera);

        var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        var sphere = Mesh.CreateSphere("sphere", 16, 2, scene);
        sphere.position.y = 1;

        return scene;
    }
}

export function CreatePlaygroundScene(engine: Engine, canvas: HTMLCanvasElement): Scene {
    return Playground.CreateScene(engine, canvas);
}
