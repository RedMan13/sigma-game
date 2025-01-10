require('./progress-event');
require('./fake-canvas');
const { init, addThreeHelpers } = require('3d-core-raub');
const { doc, gl, requestAnimationFrame } = init({ isGles3: true });
addThreeHelpers(require('three'), gl);

const tick = require('./game');
const states = require('./game/states');
doc.addEventListener('resize', () => {
	states.camera.aspect = doc.innerWidth / doc.innerHeight;
	states.camera.updateProjectionMatrix();
	tick.renderer.setSize(doc.innerWidth, doc.innerHeight);
});

const animate = time => {
    tick(time);
    requestAnimationFrame(animate);
};
animate();