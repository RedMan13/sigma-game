/** @import { Group, Mesh } from 'three' */
const findRecursive = require('./find-recursive');
const { Texture, RepeatWrapping, ShaderMaterial } = require('three');
const fs = require('fs');

const charWidth = 8;
const charHeight = 13;
const driveBayWidth = 16;
const driveBayHeight = 8;
function makePos(bin) {
    return [
        ((bin & 0b011) * driveBayWidth) / 64,
        (((bin & 0b100) >> 2) * driveBayHeight) / 64
    ]
}
const driveBayTypes = {
    FloppyOff:        makePos(0b100),
    FloppyOn:         makePos(0b000),
    FloppyRead:       makePos(0b101),
    FloppyWrite:      makePos(0b001),
    HarddiskInactive: makePos(0b111),
    HarddiskRead:     makePos(0b110),
    HarddiskWrite:    makePos(0b010),
};
const fontSet = document.createElement('canvas');
fontSet.width = charWidth * 16;
fontSet.height = charHeight * 16;

module.exports = class Computer {
    /**
     * @param {Group} model 
     */
    constructor(group) {
        /** @type {Mesh} */
        this.driveAMod = findRecursive(group, 'driveA');
        /** @type {Mesh} */
        this.driveBMod = findRecursive(group, 'driveB');
        /** @type {Mesh} */
        this.screenMod = findRecursive(group, 'screen');
        /** @type {CanvasRenderingContext2D} */
        this.fontSet = fontSet.getContext('2d');
        this.screenShader = new ShaderMaterial({
            uniforms: {
                charWidth: { value: charWidth },
                charHeight: { value: charHeight },
                screenWidth: { value: 480 },
                screenHeight: { value: 460 }
            },
            vertexShader: `
                attribute vec4 a_position;
                attribute vec2 a_texcoord;
                
                uniform mat4 u_matrix;
                
                varying vec2 v_texcoord;
                
                void main() {
                    // Multiply the position by the matrix.
                    gl_Position = u_matrix * a_position;
                    
                    // Pass the texcoord to the fragment shader.
                    v_texcoord = a_texcoord;
                }
            `,
            fragmentShader: fs.readFileSync(require.resolve('./screen-fragment.glsl'), 'utf8'),
        });
        const tex = new Texture(fontSet, undefined, RepeatWrapping, RepeatWrapping);
        tex.needsUpdate = true;
        this.screenShader.map = tex;
        this.screenMod.material = this.screenShader;
        this.initFontSet();

        this.driveA = 'HarddiskInactive';
        this.driveB = 'FloppyOff';
    }
    set driveA(type) {
        if (!driveBayTypes[type]) return;
        this._driveA = type;
        this.driveAMod.material.map.offset.x = driveBayTypes[type][0];
        this.driveAMod.material.map.offset.y = driveBayTypes[type][1];
        this.driveAMod.material.map.needsUpdate = true;
    }
    get driveA() { return this._driveA; }
    set driveB(type) {
        if (!driveBayTypes[type]) return;
        this._driveB = type;
        this.driveBMod.material.map.offset.x = driveBayTypes[type][0];
        this.driveBMod.material.map.offset.y = driveBayTypes[type][1];
        this.driveBMod.material.map.needsUpdate = true;
    }
    get driveB() { return this._driveB; }
    initFontSet() {
        this.screenShader.map.needsUpdate = true;
        this.fontSet.fillStyle = 'black';
        this.fontSet.fillRect(0,0, 480,360);
        this.fontSet.fillStyle = 'white';
        this.fontSet.textBaseline = 'top';
        for (let i = 0; i < 256; i++) {
            const x = i & 0x0F;
            const y = (i & 0xF0) >> 4;
            const char = String.fromCharCode(i);
            const { width } = this.fontSet.measureText(char);
            this.fontSet.fillText(char, (x * charWidth) + (charWidth / 2) - (width / 2), y * charHeight);
        }
    }
}