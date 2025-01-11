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

    // never use onresize, its always a frame off of actual position
    // update render viewport size
	states.camera.aspect = window.innerWidth / window.innerHeight;
	states.camera.updateProjectionMatrix();
	tick.renderer.setViewport(0,0, window.innerWidth, window.innerHeight);

    // update gui sprite size
    states.gui.canvas.width = window.innerWidth / 2;
    states.gui.canvas.height = window.innerHeight / 2;
    states.guiSprite.material.map.needsUpdate = true;
    states.camera.getViewSize(0.011, states.guiSprite.scale);
    states.guiSprite.scale.z = 1;

    states.guiSprite.position.copy(states.camera.position);
    const toAdd = new Vector3(0, 0, -0.011);
    toAdd.applyEuler(states.camera.rotation);
    states.guiSprite.position.add(toAdd);

    states.gui.resetTransform();
    states.gui.clearRect(0,0, window.innerWidth, window.innerHeight);
    states.gui.scale(1,-1);
    states.gui.fillStyle = '#00FF00';
    states.gui.font = 'monospace';
    states.gui.fillText(`FPS: ${(1 / delta).toFixed(0)}; 
Facing: X:${(states.camera.rotation.x / Math.PI * 180).toFixed(2)} Y:${(states.camera.rotation.y / Math.PI * 180).toFixed(2)} Z:${(states.camera.rotation.z / Math.PI * 180).toFixed(2)}; 
At: X:${states.camera.position.x.toFixed(2)} Y:${states.camera.position.y.toFixed(2)} Z:${states.camera.position.z.toFixed(2)}
Velocity: X:${states.velocity.x.toFixed(3)} Y:${states.velocity.y.toFixed(3)} Z:${states.velocity.z.toFixed(3)}
Paused: ${states.paused}`, 0,-55);
    renderer.render(states.scene, states.camera);
    frame++;
}
module.exports.renderer = renderer;