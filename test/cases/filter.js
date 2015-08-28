module('filter');

test('basic filters - number | thousand | rmb', function() {
    equal($.render('{{a | number(2) | thousand | rmb}}', {
        a: 12
    }), '￥12.00')

    equal($.render('{{a | number(2) | thousand | rmb}}', {
        a: 1200
    }), '￥1,200.00')

    equal($.render('{{a | number(2) | thousand | rmb}}', {
        a: 1200000
    }), '￥1,200,000.00')
});


test('basic filters - percent', function() {
    equal($.render('{{a | percent}}', {
        a: 12
    }), '1200%')

    equal($.render('{{a | percent}}', {
        a: 0.12
    }), '12%')

    equal($.render('{{a | percent}}', {
        a: 0.123
    }), '12.3%')
})



test('basic filters - doller', function() {
    equal($.render('{{a | doller}}', {
        a: 12.33
    }), '$12.33')
})

test('self-define filters', function() {
    Mustache.registerFilter({
        aaa: function(value) {
            return 'aaa' + value;
        }
    });

    equal($.render('{{a | aaa}}', {
        a: 'test'
    }), 'aaatest');
})

test('self-define filters with params', function() {
    Mustache.registerFilter({
        aaa: function(param) {
            return function(value) {
                return param + value;
            }
        }
    });

    equal($.render('{{a | aaa(321)}}', {
        a: 'test'
    }), '321test');

    equal($.render('{{a | aaa(bbb)}}', {
        a: 'test'
    }), 'bbbtest');
})








