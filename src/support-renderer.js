var addRendererSupport = (function() {

    var renderers = Mustache.__cache__.renderers = {};

    function buildRendererFn(data, name, fn) {
        data[name] = function() {
            return fn.call(this, this);
        };
    }

    function addRendererSupport(data, tmpl) {
        for (var groupName in renderers) {
            var group = renderers[groupName];
            for (var rendererName in group) {
                var fn = group[rendererName];
                var name = groupName + "_" + rendererName;
                if (tmpl.indexOf(name) != -1 && !(name in data)) {
                    buildRendererFn(data, name, fn)
                }
            }
        }
    }

    Mustache.registerRenderer = function(obj) {
        for(var prop in obj) {
            // 防止覆盖
            // list: a / list: b
            renderers[prop] = renderers[prop] || {};
            extend(renderers[prop], obj[prop]);
        }
    };

    return addRendererSupport;
    
})();