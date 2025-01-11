if (process.version !== 'v20.18.0') 
    console.warn(`HEY!!! your on node ${process.version}, this app is built to run on v20.18.0. expect errors.`);

require('./progress-event');
require('./fake-canvas');
const { init, addThreeHelpers } = require('3d-core-raub');
const { doc, gl, requestAnimationFrame } = init({ isGles3: true });
addThreeHelpers(require('three'), gl);

const tick = require('./game');
const animate = time => {
    tick(time);
    requestAnimationFrame(animate);
};
animate();