import { initializeBabylonApp } from "app_package";

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
div.appendChild(canvas);

initializeBabylonApp({ canvas: canvas });
