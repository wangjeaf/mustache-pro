
function addArrayIndexSupport(o, depth) {
    var k, v;
    for (k in o) {
        v = o[k];
        if (v instanceof Array) {
            insertArrayIndexProps(v);
        } else if (typeof(v) === "object" && depth < 5) {
            addArrayIndexSupport(v, depth + 1);
        }
    }
}

function insertArrayIndexProps(v) {
    for (var i = 0; i < v.length; i++) {
        var o = v[i];
        if (o !== null && typeof(o) === "object") {
            if (i === 0) {
                o.__first__ = true;
            } else if (i === (v.length - 1)) {
                o.__last__ = true;
            } else {
                o.__middle__ = true;
            }
            o.__index__ = i;
        }
    }
}