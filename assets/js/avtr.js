import * as THREE from "three";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod";
import { loadVideo } from "./libs/loader";

document.addEventListener("DOMContentLoaded", () => {
  let video;
  const init = async () => {
    video = await loadVideo("../assets/video/avtr-720.mp4");
    video.play();
    video.pause();
  };

  const container = document.querySelector("#container");
  const mindarThree = new MindARThree({
    container,
    imageTargetSrc: "../assets/avtr.mind",
    filterBeta: 100000,
  });

  const start = async () => {
    const { renderer, scene, camera } = mindarThree;

    const texture = new THREE.VideoTexture(video);

    const geometry = new THREE.PlaneGeometry(1, 9 / 16);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.Mesh(geometry, material);

    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(plane);

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
      renderer.render(scene, camera);
    });
  };

  const startButton = document.querySelector("#startButton");
  const stopButton = document.querySelector("#stopButton");
  const accessButton = document.querySelector("#accessButton");
  const dialog = document.querySelector("dialog");

  let appState = false;
  startButton.addEventListener("click", async () => {
    if (!appState) return;
    startButton.className = "active";
    stopButton.className = "";
    container.classList.remove("deact");
    await start();
  });
  stopButton.addEventListener("click", () => {
    startButton.className = "";
    stopButton.className = "deact";
    container.classList.add("deact");
    video.pause();
    mindarThree.stop();
    mindarThree.renderer.setAnimationLoop(null);
  });
  accessButton.addEventListener("click", async () => {
    startButton.className = "";
    await init();
    dialog.close();
    appState = true;
  });
});
