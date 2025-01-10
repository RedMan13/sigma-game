const states = require('./states');
const { player } = require('./configs');
const { Vector3 } = require('three');
const { willClamp } = require('./util/colisions');

const stageBox = [
    new Vector3(-1.5, 0, -1.5),
    new Vector3(1.5, 1.5, 1.5)
]
module.exports = function() {
    states.velocity.y += -(player.height / 80);
    states.velocity.x /= 1.5;
    states.velocity.z /= 1.5;
    states.position.add(states.velocity);
    if (willClamp(states.position.x, stageBox[0].x, stageBox[1].x)) 
        states.velocity.x = 0;
    if (willClamp(states.position.y, stageBox[0].y, stageBox[1].y)) 
        states.velocity.y = 0;
    if (willClamp(states.position.z, stageBox[0].z, stageBox[1].z)) 
        states.velocity.z = 0;
    states.position.clamp(...stageBox);
    states.camera.position.set(
        states.position.x, 
        states.position.y + player.height, 
        states.position.z
    );
}