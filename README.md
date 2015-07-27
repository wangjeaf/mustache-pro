# Mustache.js+

Make mustache.js be easier to use by developers.

## Supports

- {{#if(a==1)}} blabla {{/if(a==1)}}
- {{if(a!=1)}} blabla {{/if(a!=1)}}
- {{a | filter1 | filter2}}
- {{render_a}} if register render
- {{#include-sub-tmpl}}

## API

- Mustache.registerRender(obj)
- Mustache.registerFilter(obj)
- global.render(tmpl, data)