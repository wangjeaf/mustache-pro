# Mustache.js+

Make mustache.js be easier to use by developers.

## Supports

- `array index`: first/last/index/middle of Array
- `if` {{#if(a==1||b==3&&c==3)}} blabla {{/if(a==1||b==3&&c==3)}}
- `if` {{if(a!=1)}} blabla {{/if(a!=1)}}
- `filter` {{value | filter1 | filter2(3)}} 
- `render` {{render_value}} (if register render)
- `include` {{#include-sub-tmpl}}
- `define sub tmpl` {{#sub-tmpl-id}}{{/sub-tmpl-id}}

## API

- Mustache.registerRender(obj)
- Mustache.registerFilter(obj)
- Mustache.to_html(tmpl, data)

## Demo

### if

tmpl

```html
{{#if(a==1&&b==2||c!=3)}}123{{/if(a==1&&b==2||c!=3)}}
{{#if(a==1)}}a is 1{{/if(a==1)}}
```

data

```javascript
{
  a: 1,
  b: 2,
  c: 4
}
```
result: 

```html
123
a is 1
```

### array_index

tmpl

```html
{{#list}}
	{{__index__}}({{a}})
	{{^__last__}}、{{/__last__}}
{{/list}}
```

data

```javascript
{
  list: [{
     a: 'value1'
  }, {
     a: 'value2'
  }]
}
```

result: 

```html
0(value1)、1(value2)
```

## renderer

register renderer:

```javascript
var mapper = {
  "a": 'this is A',
  "b": 'this is B'
};

Mustache.registerRenderer({
  list: {
    desc: function() {
      return mapper[this.name]
    }
  }
});
```

tmpl:

```html
{{#list}}
  {{list_desc}}'
{{/list}}
```

data:

```javascript
{
  list: [{
    name: 'a'
  }, {
    name: 'b'
  }]
}

```

result:

```html
this is A
this is B
```

## filter


register filter:

```javascript
var mapper = {
  "a": 'this is A',
  "b": 'this is B'
};

Mustache.registerFilter({
  desc: function(name) {
    return mapper[name]
  },
  omg: function(value) {
    return 'oh my god! ' + value
  }
}
});
```

tmpl:

```html
{{#list}}
  {{name | desc | omg}}'
{{/list}}
```

data:

```javascript
{
  list: [{
    name: 'a'
  }, {
    name: 'b'
  }]
}

```

result:

```html
oh my god! this is A
oh my god! this is B
```


## sub tmpl

tmpl: 

```html
{{#list}}
    {{#if(a==1)}}
        {{#include-list}}
    {{/if(a==1)}}
{{/list}}

{{#sub-tmpl-list}}
    {{a}}
{{/sub-tmpl-list}}
```

data: 

```javascript
{
  list: [{
    a: 1
  }]
}
```

result: 

```html
1
```

## more...

in `/test/cases` dir