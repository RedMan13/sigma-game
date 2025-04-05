const { Vector3, Scene, PerspectiveCamera, Euler, AmbientLight, RectAreaLight, PointLight, SpriteMaterial, Sprite, Texture, NearestFilter, NearestMipMapLinearFilter } = require('three');
const { GLTFLoader } = require('./cloned/GLTFLoader');
const findRecursive = require('./util/find-recursive');
const Computer = require('./util/computer');

const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.rotation.set(0,Math.PI,0, 'YXZ');
camera.position.set(0,1.6,-.5);

const scene = new Scene();
function planeLight(color, intensity = 1, pos, dir, width = 1, height = 1, backWidth, backHeight) {
    backWidth ??= width;
    backHeight ??= height;
    const front = new RectAreaLight(color, intensity, width, height);
    front.position.copy(pos);
    front.rotation.copy(dir);
    const back = new RectAreaLight(color, intensity, backWidth, backHeight);
    back.position.copy(pos);
    back.rotation.copy(dir);
    back.rotateY(Math.PI);
    scene.add(front);
    scene.add(back);
}
function pointLight(color, intensity = 1, pos, distance = 200, decay = 1) {
    const light = new PointLight(color, intensity, distance, decay);
    light.position.copy(pos);
    scene.add(light);
}
const powerColor = '#cb9eff';
const glowColor = '#fffae6';
/*
planeLight(powerColor, 0.5, new Vector3(3.5, 1.5, -10.8), new Euler(0,0,0), 16, 1);
planeLight(powerColor, 0.5, new Vector3(-3, 1.5, -7.2), new Euler(0,0,0), 11, 1);
planeLight(powerColor, 0.5, new Vector3(11.5, 1.5, -7.2), new Euler(0,0,0), 7, 1);
planeLight(powerColor, 0.5, new Vector3(16.2, 1.5, -17), new Euler(0,Math.PI / 2,0), 19, 1);
planeLight(powerColor, 0.5, new Vector3(11.8, 1.5, -19), new Euler(0,Math.PI / 2,0), 15, 1);
planeLight(powerColor, 0.5, new Vector3(2.8, 1.5, -5.5), new Euler(0,Math.PI / 2,0), 2, 1);
planeLight(powerColor, 0.5, new Vector3(7.2, 1.5, -5.5), new Euler(0,Math.PI / 2,0), 2, 1);
planeLight(powerColor, 0.5, new Vector3(-9.2, 1.5, -10), new Euler(0,Math.PI / 2,0), 5, 1);
planeLight(powerColor, 0.5, new Vector3(-4.8, 1.5, -12), new Euler(0,Math.PI / 2,0), 1, 1);
planeLight(powerColor, 0.5, new Vector3(-4, 1.5, -12.8), new Euler(0,0,0), 1, 1);
planeLight(powerColor, 0.5, new Vector3(-10, 1.5, -12.8), new Euler(0,0,0), 1, 1);
pointLight(glowColor, 2, new Vector3(-6, .5, -21));
pointLight(glowColor, 2, new Vector3(-2, .5, -16));
pointLight(glowColor, 2, new Vector3(3, .5, -21));
planeLight(glowColor, 3, new Vector3(9.499, 0.5, -25), new Euler(0,Math.PI / 2,0), 1, 1);
planeLight(glowColor, 3, new Vector3(-2, 0.5, -25.499), new Euler(0,0,0), 1, 1);
planeLight(glowColor, 3, new Vector3(-10.499, 0.5, -25), new Euler(0,Math.PI / 2,0), 1, 1);
planeLight(glowColor, 3, new Vector3(-10.499, 0.5, -17), new Euler(0,Math.PI / 2,0), 1, 1);
planeLight(glowColor, 1, new Vector3(9, 0.999, -14), new Euler(0,Math.PI / 2,0), 1, 1);
pointLight(glowColor, 2, new Vector3(9, 1.25, -14));
planeLight(glowColor, 0.3, new Vector3(-3, 1.0001, -1), new Euler(Math.PI / 2,0,0), .5, .5, 1.5, 1.5);
*/
scene.add(new AmbientLight('white', 1));

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

const loader = new GLTFLoader();
loader.load('assets/bunker.gltf', bunkerData => {
    const bunker = bunkerData.scene;
    module.exports.computer = new Computer(bunker);
    console.log(module.exports.computer);
    scene.add(bunker);
});

module.exports = {
    guiSprite,
    gui: guiEl.getContext('2d'),
    camera,
    scene,
    velocity: new Vector3(0,0,0),
    position: new Vector3(0,0,-0.5),
    renderer: null,
    paused: false,
    freeCamera: true,
}