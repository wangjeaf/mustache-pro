module('together');

test('if/index/renderer/filter working together', function() {
    var tmpl = $.heredoc(function() {
        /*
  <div>
    {{#if(a=='1')}}
      <div>if判断，ok</div>
    {{/if(a=='1')}}
    fadfdas
    {{#if(a!=1)}}
      <div>if!判断，ok</div>
    {{/if(a!=1)}}
    {{#if(b!=1)}}
      <div>if!判断，ok</div>
    {{/if(b!=1)}}
    <div>{{a}} ==> {{a | percent}}</div>
    <table border=1>
    <thead>
        <th>first/last</th>
        <th>renderer</th>
        <th>filter</th>
    </thead>
    {{#list}}
    <tr>
      <td>
        {{#__first__}}
          first
        {{/__first__}}
        
        {{#__last__}}
          last
        {{/__last__}}
      </td>
      <td>{{list_showA}}</td>
      <td>by filter: {{a | number(2) | thousand | rmb}}</td>
    </tr>
    {{/list}}
    </table>
  </div>
*/
    });

    var result = $.heredoc(function() {
        /*
    <div>
      <div>if判断，ok</div>
    fadfdas
      <div>if!判断，ok</div>
    <div>1 ==> 100%</div>
    <table border=1>
    <thead>
        <th>first/last</th>
        <th>renderer</th>
        <th>filter</th>
    </thead>
    <tr>
      <td>
          first
        
      </td>
      <td>by render: 123213</td>
      <td>by filter: ￥123,213.00</td>
    </tr>
    <tr>
      <td>
        
      </td>
      <td>by render: 11111</td>
      <td>by filter: ￥11,111.00</td>
    </tr>
    <tr>
      <td>
        
          last
      </td>
      <td>by render: 1</td>
      <td>by filter: ￥1.00</td>
    </tr>
    </table>
  </div>
  */
    })


    Mustache.registerRenderer({
      list: {
        showA: function() {
          return 'by render: ' + this.a
        }
      }
    });

    var html = $.render(tmpl, {
      a: "1", 
      b: 2,
      list: [
        {a:123213},
        {a:11111},
        {a:1}]
      }
    ); 

    var node = $(html).appendTo('body');
    equal(node.find('table tbody tr').length, 3);
    equal(html, result);

    node.empty().remove();
})