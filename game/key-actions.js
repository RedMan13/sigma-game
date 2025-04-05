const states = require('./states');
const { codeNames } = require('./util/key-codes');
const { player, keyBinds } = require('./configs');
const { Vector3 } = require('three');

const activated = {};
/** @param {Vector3} vec */
function walkDir(vec) {
    return () => {
        if (!states.freeCamera) return;
        if (states.paused) return;
        states.velocity.add(vec.clone()
            .multiplyScalar(player.speed)
            .multiplyScalar(activated['Sprint'] ? 2 : 1)
            .applyAxisAngle(new Vector3(0,1,0), states.camera.rotation.y)
            .sub(states.velocity)
            .clamp(
                new Vector3(-player.speed*2,0,-player.speed*2), 
                new Vector3(player.speed*2,0,player.speed*2)
            )
        ); 
    }
}
const keys = module.exports = {
    'Pause': [true, () => {
        document.cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        states.paused = !states.paused
    }],
    'Walk Left': [false, walkDir(new Vector3(-1,0,0))],
    'Walk Right': [false, walkDir(new Vector3(1,0,0))],
    'Walk Backward': [false, walkDir(new Vector3(0,0,1))],
    'Walk Forward': [false, walkDir(new Vector3(0,0,-1))],
    'Jump': [false, () => {
        if (!states.freeCamera) return;
        if (states.velocity.y <= 0.001 && states.velocity.y >= -0.001) 
            states.velocity.y = player.jumpPower;
    }],
    'Sprint': [false, () => {}],
}
window.addEventListener('focusin', () => {
    document.cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    states.paused = false;
});
window.addEventListener('focusout', () => {
    document.cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    states.paused = true;
});
module.exports.descriptions = {
    'Pause': 'Pauses the game',
    'Walk Left': 'Walks to the left without moving the camera',
    'Walk Right': 'Walks to the right without moving the camera',
    'Walk Backward': 'Walks in reverse without moving the camera',
    'Walk Forward': 'Walks in the direction the camera is facing',
    'Jump': 'Makes the player jump up',
    'Sprint': 'Makes the player sprint'
}
module.exports.handle = function() {
    for (const name in keyBinds) {
        const down = document.getKey(Number(codeNames[keyBinds[name]]));
        if (!down) { delete activated[name]; continue; }
        const [once, action] = keys[name];
        if (once && activated[name]) continue;
        if (down) activated[name] = true;
        action();
    }
}