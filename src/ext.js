// extend Mustache
// - support renderer {{list_a}}
// - support if: {{#if(a==1)}}{{/if(a==1)}}
// - support if!: {{#if(a!=1)}}{{/if(a!=1)}}
// - support filter: {{a | filter1 | filter2}}
// - support include: {{#include-sub-tmpl-id}}
(function(global) {

    var FILTER_REG = /\{{2,3}([^\{]*?)\|(.*?)\}{2,3}/ig;
    var FILTER_CLEANER = /^\{{2,3}|\}{2,3}$/g;
    var IF_REG = /\{{2,3}[\^#]?if\((.*?)\)\}{2,3}?/ig;
    var IF_CLEANER = /\{{2,3}[\^#]?if\((.*?)\)\}{2,3}?/i;
    var FN_NAME_AND_PARAM_REG = /([^(]+)\((.*)\)/;

    var MIRROR_FN = function(val) {
        return val;
    };

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

    function $(id) {
        return document.getElementById(id);
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

    function buildRealIfFn(key) {
        // #if(a.b.c==1)
        // #if(a.b.c!=1)
        var index = key.indexOf('!=');
        var equalFlag;
        if (index == -1) {
            key = key.split("==");
            equalFlag = true;
        } else {
            key = key.split('!=');
            equalFlag = false;
        }
        var realFn = function() {
            var ns = key[0].split("."),
                value = key[1],
                curData = this;
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
                        if (equalFlag && dataValue === value) {
                            return true;
                        }
                        // should not equal
                        if (!equalFlag && dataValue !== value) {
                            return true;
                        }
                        return false;
                    }
                } catch (err) {
                    console.error(err);
                }
            }
            return false;
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
                    for (var j = 0; j < cns.length - 1; j++) {
                        d = d[cns[j]];
                    }
                    var prop = trim(cns[cns.length - 1]);
                    if (prop in d) {
                        var value = d[prop];
                        for (var k = 0; k < fns.length; k++) {
                            value = getFilterResultData(value, fns[k])
                        }
                        return value;
                    }
                } catch (err) {
                    console.error(err);
                }
            }
            return 'FILTER:ERROR';
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

    Mustache.__renderers__ = {};
    Mustache.registerRenderer = function(obj) {
        extend(Mustache.__renderers__, obj);
    };

    function addRendererSupport(data) {
        var rr = Mustache.__renderers__;
        if (!rr) {
            return
        }
        for (var mcName in rr) {
            for (var wrapperName in rr[mcName]) {
                (function() {
                    var mn = mcName,
                        wn = wrapperName;
                    var fn = rr[mn][wn];
                    data[mn + "_" + wn] = function() {
                        return fn.call(this, self);
                    };
                })();
            }
        }
    }

    global.render = function(tmpl, data) {
        if (typeof(data) === "object") {
            findArray(data, 0);
        }

        addRendererSupport(data);

        // include sub templates
        tmpl = tmpl.replace(/{{#include-(.+)}}/g, function(a, tmplId) {
            var sub = getSubTmplText(tmplId)
            return sub;
        });
        AddIfAndFilterSupport(tmpl, data);
        return Mustache.to_html(tmpl, data);
    }
})(this);