const { Vector3, Scene, PerspectiveCamera, AmbientLight, SpriteMaterial, Sprite, Texture, NearestFilter, NearestMipMapLinearFilter } = require('three');
const { GLTFLoader } = require('./cloned/GLTFLoader');

const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.rotation.set(0,0,0, 'YXZ');

const scene = new Scene();
const ambientLight = new AmbientLight('white', 1);
scene.add(ambientLight);

const loader = new GLTFLoader();
loader.load('assets/bunker.gltf', bunkerData => {
    const bunker = bunkerData.scene;
    scene.add(bunker);
});

const mat = new SpriteMaterial();
const guiSprite = new Sprite(mat);
const guiEl = document.createElement('canvas');
guiEl.width = window.innerWidth / 2;
guiEl.height = window.innerHeight / 2;
camera.getViewSize(0.011, guiSprite.scale);
guiSprite.scale.y *= -1;
guiSprite.scale.z = 1;
mat.map = new Texture(guiEl);
mat.map.flipY = false;
mat.map.minFilter = NearestMipMapLinearFilter;
mat.map.magFilter = NearestFilter;
mat.map.needsUpdate = true;
scene.add(guiSprite);

module.exports = {
    guiSprite,
    gui: guiEl.getContext('2d'),
    camera,
    scene,
    velocity: new Vector3(0,0,0),
    position: new Vector3(0,0,0),
    paused: false,
}