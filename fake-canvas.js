const { createCanvas, CanvasRenderingContext2D, Image: CanvasImage, Canvas } = require('canvas');
const Document = Object.getPrototypeOf(document).constructor;
const gl = Document.webgl;

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
function fromPixels(width, height, bpp, pixels, to2DCanvas) {
    const memSize = width * height * Math.floor(bpp / 8);
    
    // ====== MIMIC BMP
    // see https://en.wikipedia.org/wiki/BMP_file_format
    const dibSize = 40;
    const headerSize = 14 + dibSize;
    const bmpSize = headerSize + memSize;
    const fakeBmp = Buffer.allocUnsafeSlow(bmpSize);
    let pos = 0;
    
    // ---------- BMP header
    fakeBmp.write('BM', pos, 2, 'ascii');
    pos += 2;
    
    fakeBmp.writeUInt32LE(bmpSize, pos);
    pos += 4;
    
    pos += 4; // skip unused
    
    fakeBmp.writeUInt32LE(headerSize, pos);
    pos += 4;
    
    // ---------- DIB header
    
    fakeBmp.writeUInt32LE(dibSize, pos);
    pos += 4;
    
    fakeBmp.writeInt32LE(width, pos);
    pos += 4;
    
    fakeBmp.writeInt32LE(height, pos);
    pos += 4;
    
    fakeBmp.writeUInt16LE(1, pos);
    pos += 2;
    
    fakeBmp.writeUInt16LE(bpp, pos);
    pos += 2;
    
    fakeBmp.writeUInt32LE(0, pos);
    pos += 4;
    
    fakeBmp.writeUInt32LE(memSize, pos);
    pos += 4;
    
    fakeBmp.writeUInt32LE(0x0ec4, pos);
    pos += 4;
    
    fakeBmp.writeUInt32LE(0x0ec4, pos);
    pos += 4;
    
    fakeBmp.writeUInt32LE(0, pos);
    pos += 4;
    
    fakeBmp.writeUInt32LE(0, pos);
    pos += 4;
    
    // ---------- PIXELS
    pixels.copy(fakeBmp, pos);

    // Implement codebase-specific load pixels
    if (to2DCanvas) {
        const img = new CanvasImage();
        img.src = fakeBmp;
        return img;
    } else {
        const img = new Image();
        img._load(fakeBmp, true);
        return img;
    }
}  
const drawImage = CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage = function(image, ...args) {
    if (image instanceof Document.Image) {
        if (image.src.startsWith('data:')) {
            const img = new CanvasImage();
            img.src = image.src;
            image = img;
        } else {
            image = fromPixels(
                image.width, image.height, 32, 
                Buffer.from(image.data),
                true
            );
        }
    }
    drawImage.call(this, image, ...args);
}
function wrapLast(key) {
    const old = gl[key];
    gl[key] = function(...args) {
        const image = args.at(-1);
        if (image instanceof Canvas) {
            const ctx = image.getContext('2d');
            const img = fromPixels(
                image.width, image.height, 32, 
                Buffer.from(ctx.getImageData(0,0, image.width,image.height).data),
                false
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
