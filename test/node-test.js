var Mustache = require('../index.js');

console.log('主要用浏览器测试即可，本测试只是在nodejs中冒烟一下');

var equal = function(a, b) {
    console.log(a + ' == ' + b + ' ' + (a == b ? 'ok' : ' not ok'));
}

var res = Mustache.to_html('{{a | number(2) | doller}}', {
    a: 1
})

equal(res, '$1.00');

var heredoc = function(fn) {
  return fn.toString().replace(/^[^\/]+\/\*!?/, "").replace(/\*\/[^\/]+$/, "").replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, "");
}


var tmpl = heredoc(function() {
    /*
{{#list}}
    {{#if(a==1)}}
        {{#include-list}}
    {{/if(a==1)}}
{{/list}}

{{#sub-tmpl-list}}
    {{a}}
{{/sub-tmpl-list}}
    */
});

var tmpl2 = heredoc(function() {
    /*
    {{#list}}
        {{#include-list}}
    {{/list}}
    */
})

var msg = Mustache.to_html(tmpl, {
    list: [{
        a: 1
    }]
});
equal(msg.trim(), 1);
equal(Mustache.subTmpls['list'].trim(), '{{a}}');

var msg2 = Mustache.to_html(tmpl2, {
    list: [{
        a: 4
    }]
});
equal(msg2.trim(), 4);