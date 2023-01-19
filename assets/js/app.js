import * as THREE from "three";
import bezier from "bezier-easing";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod";
import { mockWithImage } from "./camera-mock";
// import { mockWithVideo } from "./helpers";
import { loadGLTF, loadAudio } from "./loader";

const container = document.querySelector("#container");
const mindarThree = new MindARThree({
  container,
  imageTargetSrc: "./assets/azeria.mind",
  // filterMinCF: 0.0001,
  filterBeta: 100000,
});
const { renderer, scene, camera } = mindarThree;
const anchor = mindarThree.addAnchor(0);
const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
scene.add(light);

const gltf = await loadGLTF("assets/3d/azeria/scene.gltf");
gltf.scene.scale.set(0.0065, 0.0065, 0.0065);
gltf.scene.position.set(-0.05, -0.04, 0);
anchor.group.add(gltf.scene);

const audioClip = await loadAudio("assets/sound/cuckoo.mp3");
const audioClip1 = await loadAudio("assets/sound/dog-walking.wav");
const audioClip2 = await loadAudio("assets/sound/dog-running.wav");
const audioClips = [audioClip, audioClip1, audioClip2];
const listener = new THREE.AudioListener();
const audioIdle = new THREE.PositionalAudio(listener);
const audioWalk = new THREE.PositionalAudio(listener);
const audioRun = new THREE.PositionalAudio(listener);
const audios = [audioIdle, audioWalk, audioRun];
camera.add(listener);
audios.forEach((audio, i) => {
  audio.setRefDistance(5);
  audio.setBuffer(audioClips[i]);
  audio.setLoop(true);
  audio.setVolume(200);
  anchor.group.add(audio);
});

const mixer = new THREE.AnimationMixer(gltf.scene);
const animations = new Array(gltf.animations.length)
  .fill(null)
  .map((_, i) => mixer.clipAction(gltf.animations[i]));
let currentAnimation = 0;
let animationDirection = -1;
animations[0].play();
anchor.onTargetFound = () => {
  audios[0].play();
  if (currentAnimation !== 0) audios[currentAnimation].play();
};
anchor.onTargetLost = () => {
  audios[0].pause();
  if (currentAnimation !== 0) audios[currentAnimation].pause();
};

const fullMotionAngle = 1.6;
const clock = new THREE.Clock();
const bezierEasing = bezier(0.42, 0, 0.58, 1);
let rotationDirection = 0.25;
let elapsed = 0;
let rotationAngle = 0.8;

const start = async () => {
  // await mockWithVideo("assets/video/azeria.mp4");
  await mockWithImage("assets/img/azeria.jpg");
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

let stateOfApp = 0;
const startButton = document.querySelector("#startButton");
const stopButton = document.querySelector("#stopButton");
const animButton = document.querySelector("#animButton");

startButton.addEventListener("click", () => {
  startButton.className = "active";
  stopButton.className = "";
  animButton.className = "";
  container.classList.remove("deact");
  if (stateOfApp > 0) {
    audios[0].play();
    if (currentAnimation !== 0) audios[currentAnimation].play();
  }
  start();
});
stopButton.addEventListener("click", () => {
  stateOfApp++;
  audios.forEach((audio) => audio.pause());
  startButton.className = "";
  stopButton.className = "deact";
  animButton.className = "deact";
  container.classList.add("deact");
  mindarThree.stop();
  mindarThree.renderer.setAnimationLoop(null);
  container.style.backgroundColor = "lightgrey";
});
const rollAnimations = () => {
  animations[currentAnimation].stop();
  if (currentAnimation !== 0) audios[currentAnimation].pause();
  if (currentAnimation >= gltf.animations.length - 1 || currentAnimation <= 0)
    animationDirection *= -1;
  currentAnimation += animationDirection;
  animations[currentAnimation].play();
  if (currentAnimation !== 0) audios[currentAnimation].play();
};
animButton.addEventListener("click", rollAnimations);

container.addEventListener("click", (e) => {
  const mouseX = (e.offsetX / container.offsetWidth) * 2 - 1;
  const mouseY = -1 * ((e.offsetY / container.offsetHeight) * 2 - 1);
  const mouse = new THREE.Vector2(mouseX, mouseY);

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersect = raycaster.intersectObject(gltf.scene, true);
  if (intersect.length) rollAnimations();
});
