import { initializeBabylonApp } from "app_package";

if (DEV_BUILD) {
    console.log("Dev!");
} else {
    console.log("Not dev!");
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

initializeBabylonApp({ canvas: canvas });
