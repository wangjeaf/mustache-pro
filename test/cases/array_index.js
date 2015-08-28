module('array_index');

test('__index__', function() {
    var result = $.render('{{#list}}{{__index__}}{{/list}}', {
        list: [{
            a: 1
        }, {
            a: 1
        }]
    });

    equal(result, '01')
})

test('__first__', function() {
    var result = $.render('{{#list}}{{__first__}}{{/list}}', {
        list: [{
            a: 1
        }, {
            a: 1
        }, {
            a: 1
        }]
    });

    equal(result, 'true')
})

test('__last__', function() {
    var result = $.render('{{#list}}{{__last__}}{{/list}}', {
        list: [{
            a: 1
        }, {
            a: 1
        }, {
            a: 1
        }]
    });

    equal(result, 'true')
})

test('__middle__', function() {
    var result = $.render('{{#list}}{{__middle__}}{{/list}}', {
        list: [{
            a: 1
        }, {
            a: 1
        }, {
            a: 1
        }]
    });

    equal(result, 'true')
})

test('{{#__first__}}', function() {
    var result = $.render('{{#list}}{{#__first__}}first{{/__first__}}{{/list}}', {
        list: [{
            a: 1
        }, {
            a: 1
        }, {
            a: 1
        }]
    });

    equal(result, 'first')
})

test('{{#__middle__}}', function() {
    var result = $.render('{{#list}}{{#__middle__}}{{a}}{{/__middle__}}{{/list}}', {
        list: [{
            a: 1
        }, {
            a: 2
        }, {
            a: 3
        }]
    });

    equal(result, '2')
})


test('{{#__last__}}', function() {
    var result = $.render('{{#list}}{{#__last__}}{{a}}{{/__last__}}{{/list}}', {
        list: [{
            a: 1
        }, {
            a: 2
        }, {
            a: 3
        }]
    });

    equal(result, '3')
})