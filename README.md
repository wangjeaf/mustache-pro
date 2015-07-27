# Mustache.js+

Make mustache.js be easier to use by developers.

## Supports

- __first__/__middle__/__last__/__index__ in Array
- {{#if(a==1)}} blabla {{/if(a==1)}}
- {{if(a!=1)}} blabla {{/if(a!=1)}}
- {{value | filter1 | filter2}} 
- {{render_value}} (if register render)
- {{#include-sub-tmpl}}

## API

- Mustache.registerRender(obj)
- Mustache.registerFilter(obj)
- global.render(tmpl, data)

## Demo

tmpl: 

```html
<div>
    {{#if(a==1)}}
      <div>if判断，ok</div>
    {{/if(a==1)}}
    {{#if(a!=1)}}
      <div>if!判断，ok</div>
    {{/if(a!=1)}}
    {{#if(b!=1)}}
      <div>if!判断，ok</div>
    {{/if(b!=1)}}
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
```

```js
Mustache.registerRenderer({
  list: {
    showA: function() {
      return 'by render: ' + this.a
    }
  }
});

var html = render($(tmpl, {
  a: 1, 
  b: 2,
  list: [
    {a:123213},
    {a:11111},
    {a:1}]
  }
); 

```

result:

```html
<div>
    <div>if判断，ok</div>
    <div>if!判断，ok</div>
    <table border="1">
    <thead>
        <tr>
            <th>first/last</th>
            <th>renderer</th>
            <th>filter</th>
        </tr>
    </thead>
    <tbody>
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
    </tbody>
    </table>
</div>
```