module('if');

test('{{#if(a==1)}}', function() {
    var result = $.render('{{#if(a==1)}}1{{/if(a==1)}}', {
        a: 1
    });
    equal(result, 1, 'if ok');
})

/*
test('{{#if(a.b==1)}}', function() {
    var result = $.render('{{#if(a.b==1)}}1{{/if(a.b==1)}}', {
        a: {
            b: 1
        }
    });
    equal(result, 1, 'if ok');
})
*/

test('{{^if(a==1)}}', function() {
    var result = $.render('{{^if(a==1)}}1{{/if(a==1)}}', {
        a: 2
    });
    equal(result, 1, 'if ok');
})

test("{{#if(a=='str')}}", function() {
    var result = $.render("{{#if(a=='str')}}1{{/if(a=='str')}}", {
        a: 'str'
    });
    equal(result, 1, 'if ok');
})

test("{{#if(a==str)}}", function() {
    var result = $.render("{{#if(a==str)}}1{{/if(a==str)}}", {
        a: 'str'
    });
    equal(result, 1, 'if ok');
})


test('{{#if(a=="str")}}', function() {
    var result = $.render('{{#if(a=="str")}}1{{/if(a=="str")}}', {
        a: "str"
    });
    equal(result, 1, 'if ok');
})

test('{{#list}}{{#if(a=="str")}}{{/list}}', function() {
    var result = $.render('{{#list}}{{#if(a=="str")}}1{{/if(a=="str")}}{{/list}}', {
        list: [{
            a: "str"
        }]
    });
    equal(result, 1, 'if ok');
})

test('{{#if(a==1&&b==2||c==3){{/if(a==1&&b==2||c==3)}}', function() {
    var result = $.render('{{#if(a==1&&b!=2||c==3)}}321{{/if(a==1&&b!=2||c==3)}}', {
        a: 1,
        b: 2,
        c: 3
    });
    equal(result, 321, 'if ok');
})

test('{{#if(a!=1&&b!=2||c!=3)}}321{{/if(a!=1&&b!=2||c!=3)}}', function() {
    var result = $.render('{{#if(a!=1&&b!=2||c!=3)}}321{{/if(a!=1&&b!=2||c!=3)}}', {
        a: 1,
        b: 2,
        c: 2
    });
    equal(result, 321, 'if ok');
})


test('{{#list}}{{#if(a!=1&&b!=2||c!=3)}}321{{/if(a!=1&&b!=2||c!=3)}}{{/list}}', function() {
    var result = $.render('{{#list}}{{#if(a!=1&&b!=2||c!=3)}}321{{/if(a!=1&&b!=2||c!=3)}}{{/list}}', {
        list: [{ // 这个ok
            a: 1,
            b: 2,
            c: 2
        }, { // 这个ok
            a: 1,
            b: 2,
            c: 2
        }, { // 这个不ok
            a: 1,
            b: 2,
            c: 3
        }]
    });
    equal(result, 321321, 'if ok');
})