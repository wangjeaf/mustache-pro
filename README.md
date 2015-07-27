# Mustache.js+

Make mustache.js be easier to use by developers.

## Supports

- {{#if(a==1)}} blabla {{/if(a==1)}}
- {{if(a!=1)}} blabla {{/if(a!=1)}}
- {{value | filter1 | filter2}} 
- {{render_value}} (if register render)
- {{#include-sub-tmpl}}

## API

- Mustache.registerRender(obj)
- Mustache.registerFilter(obj)
- global.render(tmpl, data)