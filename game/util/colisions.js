module.exports.willClamp = 
function willClamp(val, min, max) {
    return val <= min || val >= max;
}