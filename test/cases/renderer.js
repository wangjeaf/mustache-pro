module('renderer');

test('self-define renderer', function() {
    Mustache.registerRenderer({
      list: {
        showA: function() {
          return 'lalala' + this.a
        }
      }
    });

    equal($.render('{{list_showA}}', {
        a: 'fda'
    }), 'lalalafda');

    equal($.render('{{#list}}{{list_showA}}{{/list}}', {
        list: [{
            a: 'fda'
        }]
    }), 'lalalafda');
})




test('self-define renderer - multi', function() {
    Mustache.registerRenderer({
      list: {
        showA: function() {
          return 'lalala' + this.a
        },
        showB: function() {
          return 'lalala' + this.b
        }
      }
    });

    equal($.render('{{list_showA}}', {
        a: 'fda'
    }), 'lalalafda');

    equal($.render('{{#list}}{{list_showA}}{{list_showB}}{{/list}}', {
        list: [{
            a: 'fda',
            b: 'fdb'
        }]
    }), 'lalalafdalalalafdb');
})