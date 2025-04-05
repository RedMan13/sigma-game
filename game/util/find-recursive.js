module.exports = function findRecursive(obj, name) {
    if (obj.name === name) return obj
    for (const child of obj.children) {
        if (child.children?.length > 0) {
            const found = findRecursive(child, name);
            if (!found) continue;
            return found;
        }
        if (child.name === name) return child;
    }
}