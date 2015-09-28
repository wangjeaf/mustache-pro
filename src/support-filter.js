
Mustache.__cache__.filters = {};

Mustache.registerFilter = function(obj) {
    extend(Mustache.__cache__.filters, obj);
};

function addFilterSupport(template, data) {
    var filters = getFilters(template);
    for (var i = 0, l = filters.length; i < l; i++) {
        key = trim(filters[i]);
        if (data[key]) {
            continue;
        } else {
            data[key] = buildRealFilterFn(filters[i]);
        }
    }
}

function getFilters(template) {
    var gx = template.match(FILTER_REG);
    var ret = [];
    if (gx) {
        for (var i = 0, l = gx.length; i < l; i++) {
            ret.push(gx[i].replace(FILTER_CLEANER, ''));
        }
    }
    return ret;
}


function getFilterResultData(value, fnName) {
    var originValue = value;
    var fnName = trim(fnName);
    var fnParams = undefined;
    if (fnName.indexOf('(') != -1) {
        var nameAndParams = fnName.match(FN_NAME_AND_PARAM_REG);
        fnName = nameAndParams[1];
        fnParams = trim(nameAndParams[2]);
        if (fnParams) {
            fnParams = fnParams.split(',');
        }
    }
    var fn = Mustache.__cache__.filters[fnName];
    if (!fn) {
        console.error('[Mustache] Filter:' + fnName + ' is not defined, please use Mustache.registerFilter(filters) to define it.');
        return value;
    }
    if (fnParams !== undefined) {
        var resultFn = fn.apply(this, fnParams || []);
        if (typeof resultFn != 'function') {
            console.error('[Mustache] Filter:' + fnName + ' should return a function.');
            fn = MIRROR_FN;
        } else {
            fn = resultFn;
        }
    }
    value = fn(value);
    if (typeof value == 'function') {
        console.error('[Mustache] Filter:' + fnName + ' returns a function, use like this: ' + fnName + '(a,b).');
        value = originValue;
    }
    return value;
}


function buildRealFilterFn(key) {
    // {{prop.value | number(2) | thousand | rmb}}
    key = key.split("|");
    var realFn = function() {
        var ns = key[0].split("."),
            fns = key.slice(1),
            curData = this;
        for (var i = ns.length - 1; i > -1; i--) {
            var cns = ns.slice(i);
            var d = curData;
            try {
                // 找到数据
                for (var j = 0; j < cns.length - 1; j++) {
                    d = d[cns[j]];
                }
                var prop = trim(cns[cns.length - 1]);
                if (prop in d) {
                    // 取出原始数据
                    var value = d[prop];
                    // 用filter处理原始数据
                    for (var k = 0; k < fns.length; k++) {
                        var res = getFilterResultData(value, fns[k]);
                        // 有返回值时才赋值
                        if (res !== undefined) {
                            value = res;
                        } else {
                            // 没有返回值，则提示：哥们儿，你写的这个filter竟然没有返回值
                            console.error('[Mustache] Filter: ' + fns[k] + ' no return data when value is ' + value + '.')
                        }
                    }
                    // 返回处理后的数据
                    return value;
                } else {
                    return '-'
                }
            } catch (err) {
                console.error(err);
            }
        }
        return '-';
    };
    return realFn;
}
