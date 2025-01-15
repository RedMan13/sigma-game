if (process.version !== 'v20.18.0') 
    console.warn(`\n\x1b[31m\x1b[1mHEY!!! your on node \x1b[36m${process.version}\x1b[31m, this app is built to run on \x1b[32m\x1b[3mv20.18.0\x1b[31m. \x1b[4m\x1b[21mEXPECT ERRORS.\x1b[0m\n`);
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
