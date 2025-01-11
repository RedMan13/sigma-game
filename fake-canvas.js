const { createCanvas, CanvasRenderingContext2D, Image: CanvasImage, Canvas } = require('canvas');
const { Document } = require('glfw-raub');
const gl = require('webgl-raub');

const getContext = Canvas.prototype.getContext;
Canvas.prototype.getContext = function(type, args) {
    if (type === '2d') return getContext.call(this, type, args);
    return Document.webgl;
}
Canvas.prototype.style = {};
Canvas.prototype.addEventListener = () => {};
Canvas.prototype.removeEventListener = () => {};
Canvas.prototype.dispatchEvent = () => {};
global.HTMLCanvasElement = Canvas;
global.HTMLImageElement = Document.Image;
global.ImageBitmap = CanvasImage;
Document.prototype.createElement = function(name) {
    name = name.toLowerCase();
    
    if (name.indexOf('img') >= 0) {
        return new Document.Image();
    }
    
    if (name.indexOf('canvas') >= 0) {
        if (!this._isCanvasRequested) {
            this._isCanvasRequested = true;
            return this;
        }
        
        return createCanvas(1,1);
    }
    
    if (name === 'span') {
        return {
            style: {
                fontStyle: 'normal',
                fontVariant: 'normal',
                fontWeight: 'normal',
                fontSize: '1px',
                fontFamily: 'monospace',
                get font() { return `${this.fontStyle} ${this.fontVariant} ${this.fontWeight} ${this.fontSize} ${this.fontFamily}` },
                set font(val) {}
            }
        }
    }

    return null;
}
const drawImage = CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage = function(image, ...args) {
    if (image instanceof Document.Image) {
        const img = new CanvasImage();
        img.width = image.width;
        img.height = image.height;
        img.src = image.data.data;
        image = img;
    }
    drawImage.call(this, image, ...args);
}
function wrapLast(key) {
    const old = gl[key];
    gl[key] = function(...args) {
        const image = args.at(-1);
        if (image instanceof Canvas) {
            const ctx = image.getContext('2d');
            const img = Image.fromPixels(
                image.width, image.height, 32, 
                Buffer.from(ctx.getImageData(0,0, image.width,image.height).data)
            );
            args[args.length -1] = img;
        }
        old.call(this, ...args);
    }
}
wrapLast('texImage2D');
wrapLast('texImage3D');
wrapLast('texSubImage2D');
wrapLast('texSubImage3D');