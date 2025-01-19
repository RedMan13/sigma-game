const states = require('./states');
const { player } = require('./configs');
const { Vector3, Box3, Euler, Sphere, Line, BufferGeometry } = require('three');
const { willClamp } = require('./util/colisions');

const boxes = [
    // ['enclosure', new Vector3(-24, 0 -24), new Vector3(24, 24, 24)],
    // ['sphere', new Vector3(-6, 0, 0), 3],
    new Box3(new Vector3(-2, 1 -1), new Vector3(2, 1, 1))
];

module.exports.move = function move() {
    if (states.paused) return;
    states.velocity.y += -(player.height / 80);
    states.velocity.x /= 1.5;
    states.velocity.z /= 1.5;
    states.position.add(states.velocity);

    if (willClamp(false, states.position.y, 0, Infinity) !== null) states.velocity.y = 0;
    states.position.clamp(new Vector3(-Infinity, 0, -Infinity), new Vector3(Infinity, Infinity, Infinity));
    states.camera.position.set(
        states.position.x, 
        states.position.y + player.height, 
        states.position.z
    );
}
const dbg = new BufferGeometry();
dbg.setFromPoints([new Vector3(0,0,0), new Vector3(0,0,0)])
const debugLine = new Line(dbg);
states.scene.add(debugLine);
module.exports.makeChecks = function makeChecks() {
    if (states.paused) return;
    for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];
        const start = box.clampPoint(states.position, new Vector3());
        const diff = new Vector3(...box.clampPoint(states.position, new Vector3())).sub(box.getCenter(new Vector3()));
        const dir = new Euler(Math.acos(diff.z / diff.length()), Math.atan(diff.y / diff.x), 0, 'YXZ');
        const dist = box.distanceToPoint(states.position); 
        box.containsPoint(states.position) 
            ? (() => {
                const sphere = box.getBoundingSphere(new Sphere());
                const thrown = new Vector3(0,sphere.radius,0).applyEuler(dir);
                return -box.clampPoint(thrown, new Vector3()).distanceTo(states.position);
            })() 
            : box.distanceToPoint(states.position);
        if (dist > player.size || isNaN(dist)) continue;
        const remaining = player.size - dist;
        states.position.add(new Vector3(0,remaining,0).applyEuler(dir));
        dbg.setFromPoints([start, states.position]);
    }
}