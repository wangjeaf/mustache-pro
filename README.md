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

```
{{#if(a==1&&b==2||c!=3)}}123{{/if(a==1&&b==2||c!=3)}}
{{#if(a==1)}}a is 1{{/if(a==1)}}
```

data

```
{
  a: 1,
  b: 2,
  c: 4
}
```
result: 

```
123
a is 1
```

### array_index

tmpl

```
{{#list}}
	{{__index__}}({{a}})
	{{^__last__}}、{{/__last__}}
{{/list}}
```

data

```
{
  list: [{
     a: 'value1'
  }, {
     a: 'value2'
  }]
}
```

result: 

```
0(value1)、1(value2)
```

## renderer

register renderer:

```
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

```
{{#list}}
  {{list_desc}}'
{{/list}}
```

data:
```
{
  list: [{
    name: 'a'
  }, {
    name: 'b'
  }]
}

```

result:

```
this is A
this is B
```

## filter


register filter:

```
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

```
{{#list}}
  {{name | desc | omg}}'
{{/list}}
```

data:

```
{
  list: [{
    name: 'a'
  }, {
    name: 'b'
  }]
}

```

result:

```
oh my god! this is A
oh my god! this is B
```


## sub tmpl

tmpl: 

```
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

```
{
  list: [{
    a: 1
  }]
}
```

result: 

```
1
```

## more...

in `/test/cases` dir