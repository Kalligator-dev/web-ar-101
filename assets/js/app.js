import * as THREE from "three";
import bezier from "bezier-easing";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod";
import { mockWithImage } from "./camera-mock";
// import { mockWithVideo } from "./helpers";
import { loadGLTF } from "./loader";

const container = document.querySelector("#container");
const mindarThree = new MindARThree({
  container,
  imageTargetSrc: "./assets/azeria.mind",
});
const { renderer, scene, camera } = mindarThree;
const anchor = mindarThree.addAnchor(0);
const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
scene.add(light);

const gltf = await loadGLTF("assets/3d/azeria/scene.gltf");
gltf.scene.scale.set(0.0065, 0.0065, 0.0065);
gltf.scene.position.set(-0.05, -0.05, 0);
anchor.group.add(gltf.scene);

const mixer = new THREE.AnimationMixer(gltf.scene);
const animations = new Array(gltf.animations.length)
  .fill(null)
  .map((_, i) => mixer.clipAction(gltf.animations[i]));
let currentAnimation = 0;
let animationDirection = -1;
animations[0].play();

const fullMotionAngle = 1.6;
const clock = new THREE.Clock();
const bezierEasing = bezier(0.42, 0, 0.58, 1);
let rotationDirection = 0.25;
let elapsed = 0;
let rotationAngle = 0.8;

const start = async () => {
  // await mockWithVideo("assets/video/mock3.mp4");
  await mockWithImage("assets/img/mock.jpg");
  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();
    elapsed += delta * rotationDirection;
    elapsed = Math.max(Math.min(elapsed, 1), 0);
    if (elapsed <= 0 || elapsed >= 1) {
      rotationDirection *= -1;
    }
    const factor = bezierEasing(elapsed);
    rotationAngle = Math.max(
      Math.min(factor * fullMotionAngle, fullMotionAngle),
      0
    );

    gltf.scene.rotation.set(0, rotationAngle - 0.8, 0);
    mixer.update(delta);
    renderer.render(scene, camera);
  });
};
const startButton = document.querySelector("#startButton");
const stopButton = document.querySelector("#stopButton");
const animButton = document.querySelector("#animButton");

startButton.addEventListener("click", () => {
  start();
});
stopButton.addEventListener("click", () => {
  mindarThree.stop();
  mindarThree.renderer.setAnimationLoop(null);
});
animButton.addEventListener("click", () => {
  animations[currentAnimation].stop();
  if (currentAnimation >= gltf.animations.length - 1 || currentAnimation <= 0)
    animationDirection *= -1;
  currentAnimation += animationDirection;
  animations[currentAnimation].play();
});
