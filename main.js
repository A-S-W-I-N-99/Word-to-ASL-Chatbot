import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { AnimationController } from './animationController.js';
import { ASLMapper } from './aslMapper.js';

const MODEL_PATH = 'hand.glb';

let scene, camera, renderer, controls;
let animationController;
const clock = new THREE.Clock();
const aslMapper = new ASLMapper();

init();
animate();

function init() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.5, 3);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);

    const loader = new GLTFLoader();
    loader.load(MODEL_PATH, (gltf) => {
        scene.add(gltf.scene);
        animationController = new AnimationController(gltf.scene, gltf.animations);
        animationController.onLetterChange = (l) =>
            document.getElementById('current-letter-display').textContent = l;

        document.getElementById('loader').style.display = 'none';
    });

    setupUI();
}

function setupUI() {
    document.getElementById('convert-btn').onclick = () => {
        const text = document.getElementById('text-input').value;
        const seq = aslMapper.textToAnimations(text);
        animationController.playSequence(seq);
    };

    document.getElementById('play-pause-btn').onclick = () => {
        animationController.isPlaying ? animationController.pause() : animationController.resume();
    };

    document.getElementById('stop-btn').onclick = () => animationController.stop();

    document.getElementById('speed-range').oninput = (e) => {
        const s = parseFloat(e.target.value);
        document.getElementById('speed-value').textContent = s + 'x';
        animationController.setSpeed(s);
    };
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (animationController) animationController.update(delta);
    controls.update();
    renderer.render(scene, camera);
}
