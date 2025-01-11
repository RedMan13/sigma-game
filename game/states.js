const { Vector3, Scene, PerspectiveCamera, AmbientLight, SpriteMaterial, Sprite, Texture } = require('three');
const { GLTFLoader } = require('./cloned/GLTFLoader');

const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.rotation.set(0,0,0, 'YXZ');

const scene = new Scene();
const ambientLight = new AmbientLight('white', 1);
scene.add(ambientLight);

const loader = new GLTFLoader();
loader.load('game/assets/bunker.gltf', bunkerData => {
    const bunker = bunkerData.scene;
    scene.add(bunker);
});

const guiEl = document.createElement('canvas');
/*
guiEl.width = window.innerWidth;
guiEl.height = window.innerHeight;
document.addEventListener('resize', () => {
    guiEl.width = window.innerWidth;
    guiEl.height = window.innerHeight;
});*/
guiEl.width = 1;
guiEl.height = 1;
const gui = guiEl.getContext('2d');
gui.fillStyle = '#0000FF';
gui.fillRect(0,0, 1,1);
const mat = new SpriteMaterial({ map: new Texture(guiEl) });
const guiSprite = new Sprite(mat);
mat.map.needsUpdate = true;
scene.add(guiSprite);

module.exports = {
    guiSprite,
    gui,
    camera,
    scene,
    velocity: new Vector3(0,0,0),
    position: new Vector3(0,0,0),
    paused: false,
}