document.cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
document.title = 'Simga';
document.icon = './assets/icon.png';

const { WebGLRenderer, Vector3 } = require('three');
const renderer = new WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
const states = require('./states');
states.renderer = renderer;

const { mouse, player } = require('./configs');
const glfw = require('glfw-raub');
const { handle } = require('./key-actions');
const { move, makeChecks } = require('./physics');

const minGoodDelta = .017;
const minGoodFPS = 60;
const maxStatLen = 80;
const fpsStatFrames = new Array(0).fill(0);
const deltaStatFrames = new Array(0).fill(0);

let frame = 0;
let lastTime = Date.now();
let lastFrameFlush = Date.now();
let deltaFrames = [];
global.fps = NaN;
global.delta = 1;
module.exports = function tick(time) {
    delta = (time - lastTime) / 1000;
    deltaStatFrames.unshift(delta);
    if (deltaStatFrames.length > maxStatLen)
        deltaStatFrames.pop();
    lastTime = time;
    if (isNaN(fps)) fps = 1 / delta;
    deltaFrames.push(delta);
    if ((time - lastFrameFlush) > 1000) {
        fps = (1 / (deltaFrames.reduce((c,v) => c + (v || 0), 0) / deltaFrames.length)) || 0;
        deltaFrames = [];
        lastFrameFlush = Date.now();
        fpsStatFrames.unshift(fps);
        if (fpsStatFrames.length > maxStatLen)
            fpsStatFrames.pop();
    }
    if (states.paused || !states.freeCamera) {
        document.setInputMode(glfw.CURSOR, glfw.CURSOR_NORMAL);
    } else {
        document.setInputMode(glfw.CURSOR, glfw.CURSOR_HIDDEN);
        const { x:cx, y:cy } = document.cursorPos;
        const moveX = Math.round(cx - (window.innerWidth / 2)) / (window.innerWidth / 2);
        const moveY = Math.round(cy - (window.innerHeight / 2)) / window.innerHeight;
        const movePitch = moveX * mouse.sensitivity * (mouse.invertX ? 1 : -1) * Math.PI;
        const moveYaw = moveY * mouse.sensitivity * (mouse.invertY ? 1 : -1) * Math.PI;
        states.camera.rotateY(movePitch || 0);
        states.camera.rotateX(moveYaw || 0);
        states.camera.rotation.z = 0;
        document.cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }
    if (states.freeCamera) move();

    // never use onresize, its always a frame off of actual position
    // update render viewport size
	states.camera.aspect = window.innerWidth / window.innerHeight;
	states.camera.updateProjectionMatrix();
	tick.renderer.setViewport(0,0, window.innerWidth, window.innerHeight);

    // update gui sprite size
    states.guiSprite.material.map.needsUpdate = true;
    states.camera.getViewSize(0.011, states.guiSprite.scale);
    states.guiSprite.scale.y *= -1;
    states.guiSprite.scale.z = 1;
    states.gui.canvas.width = window.innerWidth / 2;
    states.gui.canvas.height = window.innerHeight / 2;

    states.guiSprite.position.copy(states.camera.position);
    const toAdd = new Vector3(0, 0, -0.011);
    toAdd.applyEuler(states.camera.rotation);
    states.guiSprite.position.add(toAdd);

    const width = states.gui.canvas.width;
    const height = states.gui.canvas.height;
    const left = -(width / 2);
    const right = width / 2;
    const top = -(height / 2);
    const bottom = height / 2;
    states.gui.resetTransform();
    states.gui.clearRect(0,0, width, height);
    states.gui.scale(1,-1);
    states.gui.translate(right, top); // make center of screen 0,0 and bottom positive y
    states.gui.fillStyle = '#1A1A1A1F';
    states.gui.fillRect(left,top,80,40);
    const fpsScaler = Math.max(minGoodFPS * 2, (fpsStatFrames.reduce((c,v) => c + v, 0) / fpsStatFrames.length) * 2);
    for (let i = maxStatLen, frame = fpsStatFrames.at(-1); i >= 0; frame = fpsStatFrames[--i]) {
        if (!frame) continue;
        const mag = frame / fpsScaler;
        const height = mag * 40;
        states.gui.fillStyle = `hsl(${((Math.min(frame / minGoodFPS, 1) ** 2) * 122).toFixed(0)}, 100%, 25%)`;
        states.gui.fillRect(left + ((maxStatLen - i) * 1), top + (40 - height), 1, height);
    }
    states.gui.fillStyle = '#00ff00';
    states.gui.fillText(`FPS: ${fps.toFixed(0)}/${minGoodFPS}`, left, top + 50);
    states.gui.fillStyle = '#1A1A1A1F';
    states.gui.fillRect(right -80,top,80,40);
    const deltaScaler = Math.max(minGoodDelta * 2, (deltaStatFrames.reduce((c,v) => v ? c + v : c, 0) / maxStatLen) * 2);
    for (let i = maxStatLen, frame = deltaStatFrames.at(-1); i >= 0; frame = deltaStatFrames[--i]) {
        if (!frame) continue;
        const mag = frame / deltaScaler;
        const height = mag * 40;
        states.gui.fillStyle = `hsl(${((Math.min((1 / frame) / minGoodFPS, 1) ** 2) * 122).toFixed(0)}, 100%, 25%)`;
        states.gui.fillRect((right -80) + ((maxStatLen - i) * 1), top + (40 - height), 1, height);
    }
    states.gui.fillStyle = '#00ff00';
    const str = `MS: ${delta * 1000}/${(minGoodDelta * 1000).toFixed(0)}`;
    const dat = states.gui.measureText(str);
    states.gui.fillText(str, right - dat.width, top + 50);
    states.gui.fillStyle = '#00FF00';
    states.gui.font = 'monospace';
    states.gui.fillText(`
Facing: X:${(states.camera.rotation.x / Math.PI * 180).toFixed(2)} Y:${(states.camera.rotation.y / Math.PI * 180).toFixed(2)} Z:${(states.camera.rotation.z / Math.PI * 180).toFixed(2)}; 
At: X:${states.position.x.toFixed(2)} Y:${states.position.y.toFixed(2)} Z:${states.position.z.toFixed(2)}
Velocity: X:${states.velocity.x.toFixed(3)} Y:${states.velocity.y.toFixed(3)} Z:${states.velocity.z.toFixed(3)}
Paused: ${states.paused}`, left,bottom -55);
    handle();
    renderer.render(states.scene, states.camera);
    frame++;
}
module.exports.renderer = renderer;