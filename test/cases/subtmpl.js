module('subtmpl');

test('basic', function() {
    var tmpl = $.heredoc(function() {
        /*
    {{#include-xxxxx}}

    {{#sub-tmpl-xxxxx}}
    {{aaa}}
    {{/sub-tmpl-xxxxx}}
        */
    });

    var msg = $.render(tmpl, {
        aaa: 1
    });
    equal($.trim(msg), 1);
})


test('basic - in list', function() {
    var tmpl = $.heredoc(function() {
        /*
    {{#list}}
        {{#include-list}}
    {{/list}}

    {{#sub-tmpl-list}}
    {{a}}
    {{/sub-tmpl-list}}
        */
    });

    var msg = $.render(tmpl, {
        list: [{
            a: 1
        }]
    });
    equal($.trim(msg), 1);
})



test('basic - in list + if', function() {
    var tmpl = $.heredoc(function() {
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

    var msg = $.render(tmpl, {
        list: [{
            a: 1
        }]
    });
    equal($.trim(msg), 1);
    equal($.trim(Mustache.subTmpls['list']), '{{a}}')
})





test('basic - share sub tmpls between tmpl', function() {
    var tmpl = $.heredoc(function() {
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

    var tmpl2 = $.heredoc(function() {
        /*
        {{#list}}
            {{#include-list}}
        {{/list}}
        */
    })

    var msg = $.render(tmpl, {
        list: [{
            a: 1
        }]
    });
    equal($.trim(msg), 1);
    equal($.trim(Mustache.subTmpls['list']), '{{a}}');

    var msg2 = $.render(tmpl2, {
        list: [{
            a: 4
        }]
    });
    equal($.trim(msg2), 4);
})


