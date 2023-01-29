import { MindARThree } from "mind-ar/dist/mindar-image-three.prod";
import { loadVideo } from "./libs/loader.js";
import { CSS3DObject } from "../../node_modules/three/examples/jsm/renderers/CSS3DRenderer";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector("#container");
  const mindarThree = new MindARThree({
    container,
    imageTargetSrc: "../assets/avtr.mind",
  });
  const { renderer, cssRenderer, cssScene, camera } = mindarThree;

  const video = await loadVideo("../assets/video/avtr-720.mp4");
  video.style.width = "1024px";
  video.style.height = "576px";
  const start = async () => {
    const cssObj = new CSS3DObject(video);
    const anchor = mindarThree.addCSSAnchor(0);
    anchor.group.add(cssObj);
    anchor.onTargetFound = () => {
      video.play();
    };
    anchor.onTargetLost = () => {
      video.pause();
    };
    video.addEventListener("play", () => {
      video.currentTime = 1.85;
    });

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      cssRenderer.render(cssScene, camera);
    });
  };

  const startButton = document.getElementById("startButton");
  const stopButton = document.getElementById("stopButton");
  startButton.addEventListener("click", async () => {
    startButton.className = "active";
    stopButton.className = "";
    container.classList.remove("deact");

    await start();
  });
  stopButton.addEventListener("click", () => {
    video.pause();
    renderer.clear();
    renderer.setAnimationLoop(null);
    mindarThree.stop();
    startButton.className = "";
    stopButton.className = "deact";
    container.classList.add("deact");
  });
});
