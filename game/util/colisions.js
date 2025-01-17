module.exports.willClamp = 
function willClamp(inv, val, min, max) {
    return inv 
        ? val >= min && val <= max
        : val <= min ? min : val >= max ? max : null;
}