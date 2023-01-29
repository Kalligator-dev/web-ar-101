import * as THREE from "three";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("#container");
  const button = document.querySelector("button");
  const buttonAnim = document.querySelector(".btn-anim");

  const init = async () => {
    const supported =
      navigator.xr && (await navigator.xr.isSessionSupported("immersive-ar"));

    if (!supported) {
      button.textContent = "not supported";
      button.disabled = true;
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, -0.3);
    scene.add(mesh);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    let currentSession;
    const start = async () => {
      currentSession = await navigator.xr.requestSession("immersive-ar", {
        optionalFeatures: ["dom-overlay"],
        domOverlay: { root: document.body },
      });
      renderer.xr.enabled = true;
      renderer.xr.setReferenceSpaceType("local");
      await renderer.xr.setSession(currentSession);

      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
    };

    const end = async () => {
      currentSession.end();
      renderer.clear();
      renderer.setAnimationLoop(null);
    };

    button.addEventListener("click", async () => {
      if (!currentSession) {
        button.className = "cam";
        button.textContent = "Stop";
        container.classList.remove("deact");
        setTimeout(() => {
          buttonAnim.classList.add("anime");
        }, 800);

        start();
      } else {
        button.className = "";
        button.textContent = "Start";
        container.classList.add("deact");
        buttonAnim.classList.remove("anime");

        end();
      }
    });
  };
  init();
});
