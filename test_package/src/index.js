import { initializeBabylonApp } from "app_package";

let assetHostUrl;
if (DEV_BUILD) {
    assetHostUrl = "http://127.0.0.1:8181/";
} else {
    assetHostUrl = "https://syntheticmagus.github.io/fruit-falling-assets/";
}

document.body.style.width = "100%";
document.body.style.height = "100%";
document.body.style.margin = "0";
document.body.style.padding = "0";

const div = document.createElement("div");
div.style.width = "25%";
div.style.margin = "0 auto";
div.style.aspectRatio = "9 / 16";
document.body.appendChild(div);

const canvas = document.createElement("canvas");
canvas.id = "renderCanvas";
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.display = "block";

const fullscreenButton = document.createElement("button");
fullscreenButton.textContent = "Go fullscreen!";
fullscreenButton.addEventListener("click", () => {
    canvas.requestFullscreen();
});
fullscreenButton.style.width = "100%";

div.appendChild(fullscreenButton);
div.appendChild(canvas);

initializeBabylonApp({ 
    canvas: canvas,
    backgroundTitleUrl: assetHostUrl + "background_title.png",
    backgroundGameUrl: assetHostUrl + "background_game.png",
    buttonPlankUrl: assetHostUrl + "button_plank.png",
    imageGameOverUrl: assetHostUrl + "image_game_over.png",
    spritesheetButtonFrameUrl: assetHostUrl + "spritesheet_button_frame.png",
    spritesheetFruitUrl: assetHostUrl + "spritesheet_fruit.png",
    spritesheetMouthUrl: assetHostUrl + "spritesheet_mouth.png"
});
