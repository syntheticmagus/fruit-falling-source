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
document.body.style.overflow = "hidden";

const canvas = document.createElement("canvas");

const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};
window.addEventListener("resize", handleResize);
handleResize();

document.body.appendChild(canvas);

initializeBabylonApp({ 
    canvas: canvas,
    backgroundTitleUrl: assetHostUrl + "background_title.png",
    backgroundGameUrl: assetHostUrl + "background_game.png",
    buttonPlankUrl: assetHostUrl + "button_plank.png",
    imageGameOverUrl: assetHostUrl + "image_game_over.png",
    spritesheetButtonFrameUrl: assetHostUrl + "spritesheet_button_frame.png",
    spritesheetFruitUrl: assetHostUrl + "spritesheet_fruit.png",
    spritesheetMouthUrl: assetHostUrl + "spritesheet_mouth.png",
    soundMusicUrl: assetHostUrl + "sound_music.mp3",
    soundChompUrl: assetHostUrl + "sound_chomp.mp3",
    soundChompYumUrl: assetHostUrl + "sound_chomp_yum.mp3",
    soundChompYuckUrl: assetHostUrl + "sound_chomp_yuck.mp3",
    soundCountdownUrl: assetHostUrl + "sound_countdown.mp3",
    soundGoUrl: assetHostUrl + "sound_go.mp3",
    soundClickUrl: assetHostUrl + "sound_click.mp3"
});
