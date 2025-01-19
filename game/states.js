const { Vector3, Scene, PerspectiveCamera, AmbientLight, RectAreaLight, HemisphereLight, PointLight, SpriteMaterial, Sprite, Texture, NearestFilter, NearestMipMapLinearFilter } = require('three');
const { GLTFLoader } = require('./cloned/GLTFLoader');

const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.rotation.set(0,0,0, 'YXZ');

const scene = new Scene();
const lightBar1 = new RectAreaLight('#cb9eff', 1, 16, 1);
lightBar1.rotation.y = Math.PI;
lightBar1.position.x = 1.5;
lightBar1.position.z = -11.5;
lightBar1.position.y = 1.5;
const lightBar2 = new RectAreaLight('#cb9eff', 1, 16, 1);
lightBar2.position.copy(lightBar1);
lightBar2.position.z += 0.5;
const pointLight = new PointLight('white', 1, 6, 0.10);
pointLight.position.x = -3;
pointLight.position.y = 0.5;
pointLight.position.z = -1;
scene.add(new AmbientLight('white', 1));
// scene.add(lightBar1, lightBar2, pointLight);
/*
const loader = new GLTFLoader();
loader.load('assets/bunker.gltf', bunkerData => {
    const bunker = bunkerData.scene;
    scene.add(bunker);
});*/

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