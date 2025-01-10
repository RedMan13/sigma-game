const { createCanvas, CanvasRenderingContext2D, Image: CanvasImage, Canvas } = require('canvas');
const { Document } = require('glfw-raub');

const old = Canvas.prototype.getContext;
Canvas.prototype.getContext = function(type, args) {
    if (type === '2d') return old.call(this, type, args);
    return Document.webgl;
}
Canvas.prototype.style = {};
Canvas.prototype.addEventListener = () => {};
Canvas.prototype.removeEventListener = () => {};
Canvas.prototype.dispatchEvent = () => {};
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
const real = CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage = function(image, ...args) {
    if (image instanceof Document.Image) {
        const img = new CanvasImage();
        img.width = image.width;
        img.height = image.height;
        img.src = image.data.data;
        image = img;
    }
    real.call(this, image, ...args);
}