test('APIs', function() {
    equal(typeof Mustache.registerRenderer, 'function');
    equal(typeof Mustache.registerFilter, 'function');
})

test('Renderer', function() {
    Mustache.registerRenderer({
        list: {
            a: function() {
                return this.a + ' rendered'
            }
        }
    });

    var tmpl = '{{list_a}}';
    var data = {
        a: 1
    };

    var html = render(tmpl, data);
    equal(html, '1 rendered');
});

test('{{#if(a==1)}}', function() {
    var tmpl = '{{#if(a==1)}}321{{/if(a==1)}}';
    var data = {
        a: 1
    };

    var html = render(tmpl, data);
    equal(html, '321');
});


test('{{#if(a!=1)}}', function() {
    var tmpl = '{{#if(a!=1)}}321{{/if(a!=1)}}';
    var data = {
        a: 2
    };

    var html = render(tmpl, data);
    equal(html, '321');
});


test('{{#if}} in list', function() {
    var tmpl = '{{#list}}{{#if(a==1)}}111{{/if(a==1)}}{{#if(a!=1)}}222{{/if(a!=1)}}{{/list}}';
    var data = {
        list: [
            {a: 1},
            {a: 2}
        ]
    }
    var html = render(tmpl, data);
    equal(html, '111222');
});


test('filters:number', function() {
    var tmpl = '{{a | number(2)}}';
    var data = {
        a: 100
    };
    var html = render(tmpl, data);
    equal(html, '100.00');

    var tmpl = '{{a | number(6)}}';
    var data = {
        a: 100
    };
    var html = render(tmpl, data);
    equal(html, '100.000000');
});

test('filters:thousand', function() {
    var tmpl = '{{a | thousand}}';
    var data = {
        a: 10
    };
    var html = render(tmpl, data);
    equal(html, '10');

    var tmpl = '{{a | thousand}}';
    var data = {
        a: 10000
    };
    var html = render(tmpl, data);
    equal(html, '10,000');

    var tmpl = '{{a | thousand}}';
    var data = {
        a: 100000.3
    };
    var html = render(tmpl, data);
    equal(html, '100,000.3');
})

test('filters:doller-$', function() {
    var tmpl = '{{a | doller}}';
    var data = {
        a: 10
    };
    var html = render(tmpl, data);
    equal(html, '$10');
})

test('filters:rmb-￥', function() {
    var tmpl = '{{a | rmb}}';
    var data = {
        a: 10
    };
    var html = render(tmpl, data);
    equal(html, '￥10');
})

test('filters:percent', function() {
    var tmpl = '{{a | percent}}';
    var data = {
        a: 0.45
    };
    var html = render(tmpl, data);
    equal(html, '45%');
})


test('filters:combine-number+thousand+doller', function() {
    var tmpl = '{{a | number(2) | thousand | doller}}';
    var data = {
        a: 12345
    };
    var html = render(tmpl, data);
    equal(html, '$12,345.00');
})

test('filters:registerFilter', function() {
    Mustache.registerFilter({
        lalala: function(value) {
            return value + 'lalala';
        }
    })
    var tmpl = '{{a | percent | lalala}}';
    var data = {
        a: 0.45
    };
    var html = render(tmpl, data);
    equal(html, '45%lalala');
})

test('include', function() {
    var tmpl = '{{a}}{{#include-sub-tmpl}}';
    var data = {
        a: 1
    };
    var html = render(tmpl, data);
    equal(html, '11');
})






