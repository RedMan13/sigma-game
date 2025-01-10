const { Vector3, Scene, PerspectiveCamera, AmbientLight } = require('three');
const TextSprite = require('@seregpie/three.text-sprite');
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

const sprite = new TextSprite({
    alignment: 'left',
    color: '#24ff00',
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: 8,
    fontStyle: 'italic',
    text: [
        'Twinkle, twinkle, little star,',
        'How I wonder what you are!',
        'Up above the world so high,',
        'Like a diamond in the sky.',
    ].join('\n'),
});
scene.add(sprite);

module.exports = {
    camera,
    scene,
    velocity: new Vector3(0,0,0),
    position: new Vector3(0,0,0),
    paused: false,
}