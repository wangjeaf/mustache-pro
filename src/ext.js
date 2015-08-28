// extend Mustache
// - 支持renderer {{list_a}}
// - 支持if判断 {{#if(a==1)}}{{/if(a==1)}}
// - 支持if!判断 {{#if(a!=1)}}{{/if(a!=1)}}
// - 支持过滤器{{a | filter1 | filter2}}
// - 支持include子模板：{{#include-sub-tmpl-id}}
//    - 子模板可以来自{{#sub-tmpl-tmpl-id}}{{/sub-tmpl-tmpl-id}}
//    - 子模板也可以来自 <script type="text/tmpl" id="tmpl-id"></script>

var Mustache = mustache;

var FILTER_REG = /\{{2,3}([^\{]*?)\|(.*?)\}{2,3}/ig;
var FILTER_CLEANER = /^\{{2,3}|\}{2,3}$/g;
var IF_REG = /\{{2,3}[\^#]?if\((.*?)\)\}{2,3}?/ig;
var IF_CLEANER = /\{{2,3}[\^#]?if\((.*?)\)\}{2,3}?/i;
var FN_NAME_AND_PARAM_REG = /([^(]+)\((.*)\)/;
var QUOTE_REG = /^['"]|["']$/g;
var SUBTMPLREG = /\{{2}#sub-tmpl-([^\}]+)\}{2}([\s\S]*?)\{{2}\/sub-tmpl(?:-\1)?\}{2}/gi;

var MIRROR_FN = function(val) {
    return val;
};

function $(id) {
    return document.getElementById(id);
}

function trim(str) {
    if (!str) {
        return str;
    }
    return str.replace(/^\s+|\s+$/g, '')
}

function extend(dest, src) {
    if (dest && src) {
        for (var prop in src) {
            if (src.hasOwnProperty(prop)) {
                dest[prop] = src[prop];
            }
        }
    }
}

function getSubTmplText(tmplId) {
    if (typeof jQuery != 'undefined') {
        return $('#' + tmplId).text();
    } else {
        var node = $(tmplId);
        if (!node) {
            return '';
        }
        var sub = node.innerText;
        return sub;
    }
}

function AddIfAndFilterSupport(template, data) {
    var ifs = getIfConditions(template);
    var key = "";
    for (var i = 0; i < ifs.length; i++) {
        key = "if(" + ifs[i] + ")";
        if (data[key]) {
            continue;
        } else {
            data[key] = buildRealIfFn(ifs[i]);
        }
    }

    var filters = getFilters(template);
    for (var i = 0; i < filters.length; i++) {
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
        for (var i = 0; i < gx.length; i++) {
            ret.push(gx[i].replace(FILTER_CLEANER, ''));
        }
    }
    return ret;
}

function getIfConditions(template) {
    var gx = template.match(IF_REG);
    var ret = [];
    if (gx) {
        for (var i = 0; i < gx.length; i++) {
            ret.push(gx[i].match(IF_CLEANER)[1]);
        }
    }
    return ret;
}

// 扩展出来的if操作符，不支持 {{if(a.b.c==1)}} 的判断
// 原生Mustache就会过滤掉这种if，不进入function
/**
  var msg = Mustache.to_html('{{a.b}} {{if(a.b=1)}}', {
    a: {
      b: '321'
    },
    'if(a.b=1)': function() {
      return 'fda'
    }
  });
  ==> msg一直都是321
   */

// 支持的操作符：&& ||
// 例如：{{#if(a==1||b==2&&c==3)}}{{/if(a==1||b==2&&c==3)}}
function parseOperations(key, data) {
    // 三个以上=，在这里都是==
    key = key.replace(/===/g, '==');
    // 先处理 ||，有一个为true就够了
    var keys = key.split('||');
    var res;

    for (var i = 0; i < keys.length; i++) {
        res = getAndResult(keys[i], data);
        if (res) {
            return true;
        }
    }
    return false;
}

function getAndResult(key, data) {
    // 再处理&&，所有都要为true才行
    var keys = key.split('&&');
    var res;

    for (var i = 0; i < keys.length; i++) {
        res = getAtomResult(keys[i], data);
        if (!res) {
            return false;
        }
    }
    return true;
}

// 获得原子计算符的取值，例如：a==1或者a!=1等
function getAtomResult(key, data) {
    var index = key.indexOf('!=');
    var operator;
    var equalFlag;
    if (index == -1) {
        key = key.split("==");
        operator = '=='
    } else {
        key = key.split('!=');
        operator = '!='
    }

    var ns = key[0].split("."),
        value = key[1],
        curData = data;
    // 去掉前后两个 " 或者 '，便于直接值比对
    value = value.replace(QUOTE_REG, '');
    for (var i = ns.length - 1; i > -1; i--) {
        var cns = ns.slice(i);
        var d = curData;
        try {
            for (var j = 0; j < cns.length - 1; j++) {
                d = d[cns[j]];
            }
            var prop = cns[cns.length - 1];
            if (prop in d) {
                var dataValue = d[prop].toString();
                // should equal
                if (operator == '==' && dataValue === value) {
                    return true;
                }
                // should not equal
                if (operator == '!=' && dataValue !== value) {
                    return true;
                }
                return false;
            }
        } catch (err) {
            console.error(err);
        }
    }
    return false;
}

function buildRealIfFn(key) {
    var realFn = function() {
        return parseOperations(key, this);
    };
    return realFn;
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
    var fn = Mustache.__filters__[fnName];
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

function findArray(o, depth) {
    var k, v;
    for (k in o) {
        v = o[k];
        if (v instanceof Array) {
            addArrayIndex(v);
        } else if (typeof(v) === "object" && depth < 5) {
            findArray(v, depth + 1);
        }
    }
}

function addArrayIndex(v) {
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

Mustache.__filters__ = {};
Mustache.registerFilter = function(obj) {
    extend(Mustache.__filters__, obj);
};

Mustache.__renderers = {};
Mustache.registerRenderer = function(obj) {
    extend(Mustache.__renderers, obj);
};

function addRendererSupport(data, tmpl) {
    var rr = Mustache.__renderers;
    if (!rr) {
        return
    }
    for (var mcName in rr) {
        for (var wrapperName in rr[mcName]) {
            (function() {
                var mn = mcName,
                    wn = wrapperName;
                var fn = rr[mn][wn];
                var name = mn + "_" + wn;
                if (tmpl.indexOf(name) != -1 && !(name in data)) {
                    data[name] = function() {
                        return fn.call(this, self);
                    };
                }
            })();
        }
    }
}

Mustache.subTmpls = {};

function getSubTmpls(tmpl) {
    if (!tmpl || typeof tmpl != 'string') {
        return tmpl;
    }
    tmpl = tmpl.replace(SUBTMPLREG, function(match, key, content) {
        Mustache.subTmpls[key] = content;
        return '';
    });
    return tmpl;
}

var oldMustacheRender = Mustache.to_html;
Mustache.to_html = function(tmpl, data, partials, send) {
    data = data || {};
    if (typeof(data) === "object") {
        findArray(data, 0);
    }

    tmpl = getSubTmpls(tmpl);

    // 支持include子模板
    tmpl = tmpl.replace(/{{#include-(.+)}}/g, function(a, tmplId) {
        var tmpl = Mustache.subTmpls[tmplId];
        if (tmpl) {
            return tmpl;
        }
        // 如果不是mx-tmpl形式的子节点，则找script标签
        var sub = getSubTmplText(tmplId)
        return sub;
    });

    addRendererSupport(data, tmpl);
    AddIfAndFilterSupport(tmpl, data);
    return oldMustacheRender.apply(Mustache, arguments);
}