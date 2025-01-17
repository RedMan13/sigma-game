const playerHeight = 2;
const resets = {
    mouse: {
        sensitivity: 1,
        invertX: false,
        invertY: false
    },
    player: {
        height: playerHeight,
        _speed: 0,
        get speed() { return (this.height / 5) + this._speed },
        set speed(newSpeed) { this._speed = newSpeed },
        _jumpPower: 0,
        get jumpPower() { return ((playerHeight / 6) * 1.5) + this._jumpPower },
        set jumpPower(newJumpPower) { this._jumpPower = newJumpPower },
        get size() { return this.height / 8 }
    },
    keyBinds: {
        'Pause': 'Escape',
        'Walk Forward': 'W',
        'Walk Backward': 'S',
        'Walk Left': 'A',
        'Walk Right': 'D',
        'Jump': ' ',
        'Sprint': 'ShiftLeft'
    }
};
module.exports = {
    ...resets,
    reset(obj = resets) {
        for (const [k,v] of Object.entries(obj)) {
            if (typeof v === 'object') { this.reset(v); continue; }
            this[k] = v;
        }
    }
};