// ansi escape codes my beloved
if (!process.version.startsWith('v20')) 
    console.warn(`\n\x1b[31m\x1b[1mHEY!!! your on node \x1b[36m${process.version}\x1b[31m, this app is built to run on \x1b[32m\x1b[3mv20\x1b[31m. \x1b[4m\x1b[21mEXPECT ERRORS.\x1b[0m\n`);
const { init, addThreeHelpers } = require('3d-core-raub');
const { gl, requestAnimationFrame } = init({ isGles3: true });
addThreeHelpers(require('three'), gl);

require('./progress-event');
require('./fake-canvas');
const tick = require('./game');
const animate = time => {
    tick(time);
    requestAnimationFrame(animate);
};
animate();
