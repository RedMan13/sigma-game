const states = require('./states');
const { player } = require('./configs');
const { Vector3, Euler } = require('three');
const { willClamp } = require('./util/colisions');

let boxLen = 0;
const boxes = [
    ['enclosure', new Vector3(-24, 0 -24), new Vector3(24, 48, 24)],
    // ['sphere', new Vector3(-6, 0, 0), 3],
    ['box', new Vector3(-2, 0 -1), new Vector3(2, 1, 1)]
]
setInterval(() => {
    boxLen = 0;
    boxes.sort(a => {
        switch (a[0]) {
        case 'enclosure':
        case 'box': {
            const diffMin = a[1].clone().sub(states.position);
            const diffMax = a[2].clone().sub(states.position);
            const diffMinMax = a[1].clone().sub(a[2]);
            const dist = Math.min(
                Math.sqrt((diffMin.x ** 2) + (diffMin.z ** 2) + (diffMin.y ** 2)), 
                Math.sqrt((diffMax.x **2 ) + (diffMin.z ** 2) + (diffMin.y ** 2)), 
                Math.sqrt((diffMin.x ** 2) + (diffMax.z **2 ) + (diffMin.y ** 2)), 
                Math.sqrt((diffMax.x **2 ) + (diffMax.z **2 ) + (diffMin.y ** 2)), 
                Math.sqrt((diffMin.x ** 2) + (diffMin.z ** 2) + (diffMax.y **2 )),
                Math.sqrt((diffMax.x **2 ) + (diffMin.z ** 2) + (diffMax.y **2 )),
                Math.sqrt((diffMin.x ** 2) + (diffMax.z **2 ) + (diffMax.y **2 )),
                Math.sqrt((diffMax.x **2 ) + (diffMax.z **2 ) + (diffMax.y **2 ))
            ) - (Math.sqrt((diffMinMax.x ** 2) + (diffMinMax.z ** 2) + (diffMinMax.y ** 2)) / 2);
            if (dist < 2) boxLen++;
            return dist;
        }
        case 'sphere': {
            const dist = a[1].distanceTo(states.position) - a[2];
            if (dist < 2) boxLen++;
            return dist;
        }
        }
    });
}, 1 / 20);

module.exports = function() {
    if (states.paused) return;
    states.velocity.y += -(player.height / 80);
    states.velocity.x /= 1.5;
    states.velocity.z /= 1.5;
    states.position.add(states.velocity);
    for (let i = 0; i < boxLen; i++) {
        const [type, min, max] = [boxes[i][0], boxes[i][1].clone(), boxes[i][2]?.clone?.() ?? boxes[i][2]];
        switch (type) {
        case 'enclosure':
            min.x += player.size;
            min.z += player.size;
            max.x -= player.size;
            max.z -= player.size;
            const clampX = states.position.x <= min.x 
                ? min.x 
                : states.position.z >= max.x 
                    ? max.x 
                    : null;
            const clampY = states.position.y <= min.y 
                ? min.y 
                : states.position.z >= max.y 
                    ? max.y 
                    : null;
            const clampZ = states.position.z <= min.z
                ? min.z
                : states.position.z >= max.z
                    ? max.z
                    : null;
            if (clampX !== null) {
                states.velocity.x = 0;
                states.position.x = clampX;
            }
            if (clampY !== null) {
                states.velocity.y = 0;
                states.position.y = clampY;
            }
            if (clampZ !== null) {
                states.velocity.z = 0;
                states.position.z = clampZ;
            }
            break;
        case 'box':
            min.x -= player.size;
            min.z -= player.size;
            max.x += player.size;
            max.z += player.size;
            if (!(min.x <= states.position.x && max.x >= states.position.x && 
                min.y <= states.position.y && max.x >= states.position.y && 
                min.z <= states.position.z && max.x >= states.position.z
            )) break;
            const distMinX = states.position.x - min.x;
            const distMaxX = max.x - states.position.x;
            const distMinY = states.position.y - min.y;
            const distMaxY = max.y - states.position.y;
            const distMinZ = states.position.z - min.z;
            const distMaxZ = max.z - states.position.z;
            const closest = Math.min(
                distMinX, distMaxX,
                distMinY, distMaxY,
                distMinZ, distMaxZ
            );
            if (closest == distMaxX) {
                states.position.x = max.x;
                states.velocity.x = 0;
                break;
            }
            if (closest == distMaxY) {
                states.position.y = max.y;
                states.velocity.y = 0;
                break;
            }
            if (closest == distMaxZ) {
                states.position.y = max.y;
                states.velocity.y = 0;
                break;
            }
            if (closest == distMinX) {
                states.position.x = min.x;
                states.velocity.x = 0;
                break;
            }
            if (closest == distMinY) {
                states.position.y = min.y;
                states.velocity.y = 0;
                break;
            }
            if (closest == distMinZ) {
                states.position.z = min.z;
                states.velocity.z = 0;
                break;
            }
            break;
        case 'sphere':
            /** @type {Vector3} */
            const diff = min.clone().sub(states.position);
            const dist = Math.cbrt((diff.x ** 2) - (diff.z ** 2) - (diff.y ** 2));
            if (dist + player.size <= max) {
                const dir = diff.clone().normalize();
                const mag = max - (dist + player.size);
                states.position.add(new Vector3(0,0,mag)
                    .applyEuler(new Euler(dir.x, dir.y, 0, 'YXZ'))
                );
            }
        }
    }
    if (willClamp(false, states.position.y, 0, Infinity) !== null) states.velocity.y = 0;
    states.position.clamp(new Vector3(-Infinity, 0, -Infinity), new Vector3(Infinity, Infinity, Infinity));
    states.camera.position.set(
        states.position.x, 
        states.position.y + player.height, 
        states.position.z
    );
}