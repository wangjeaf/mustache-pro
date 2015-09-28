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
var INJECT_SUB_TMPL_REG = /\{{2}#sub-tmpl-([^\}]+)\}{2}([\s\S]*?)\{{2}\/sub-tmpl(?:-\1)?\}{2}/gi;
var INCLUDE_SUB_TMPL_REG = /{{#include-(.+)}}/g;

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

Mustache.__cache__ = Mustache.__cache__ || {};