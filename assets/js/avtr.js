import * as THREE from "three";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod";
import { loadVideo } from "./libs/loader";

const container = document.querySelector("#container");
const mindarThree = new MindARThree({
  container,
  imageTargetSrc: "./assets/avtr.mind",
  filterBeta: 100000,
});
const { renderer, scene, camera } = mindarThree;

const video = await loadVideo("assets/video/avtr-720.mp4");
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

const start = async () => {
  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
};

const startButton = document.querySelector("#startButton");
const stopButton = document.querySelector("#stopButton");

startButton.addEventListener("click", () => {
  startButton.className = "active";
  stopButton.className = "";
  container.classList.remove("deact");
  start();
});
stopButton.addEventListener("click", () => {
  startButton.className = "";
  stopButton.className = "deact";
  container.classList.add("deact");
  mindarThree.stop();
  mindarThree.renderer.setAnimationLoop(null);
});
