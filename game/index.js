document.cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
document.title = 'Simga';
document.icon = './assets/icon.png';

const { WebGLRenderer, Vector3 } = require('three');
const renderer = new WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const states = require('./states');
const { mouse } = require('./configs');
const glfw = require('glfw-raub');
const { handle } = require('./key-actions');
const physics = require('./physics');

let frame = 0;
let lastTime = Date.now();
global.delta = 1;
module.exports = function tick(time) {
    delta = (time - lastTime) / 1000;
    lastTime = time;
    if (states.paused) {
        document.setInputMode(glfw.CURSOR, glfw.CURSOR_NORMAL);
    } else {
        document.setInputMode(glfw.CURSOR, glfw.CURSOR_HIDDEN);
        const { x:cx, y:cy } = document.cursorPos;
        const moveX = Math.round(cx - (window.innerWidth / 2)) / (window.innerWidth / 2);
        const moveY = Math.round(cy - (window.innerHeight / 2)) / window.innerHeight;
        const movePitch = moveX * mouse.sensitivity * (mouse.invertX ? 1 : -1) * Math.PI;
        const moveYaw = moveY * mouse.sensitivity * (mouse.invertY ? 1 : -1) * Math.PI
        states.camera.rotateY(movePitch);
        states.camera.rotateX(moveYaw);
        states.camera.rotation.z = 0;
        document.cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }
    handle();
    physics();
    states.guiSprite.position.copy(states.camera.position);
    const toAdd = new Vector3(0, 0, -0.011);
    toAdd.applyEuler(states.camera.rotation);
    states.guiSprite.position.add(toAdd);
    renderer.render(states.scene, states.camera);
    frame++;
}
module.exports.renderer = renderer;