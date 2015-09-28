
Mustache.__cache__.renderers = {};
Mustache.registerRenderer = function(obj) {
    extend(Mustache.__cache__.renderers, obj);
};

function addRendererSupport(data, tmpl) {
    var rr = Mustache.__cache__.renderers;
    if (!rr) {
        return
    }
    for (var mcName in rr) {
        for (var wrapperName in rr[mcName]) {
            (function() {
                var mn = mcName,
                    wn = wrapperName;
                var fn = rr[mn][wn];
                var name = mn + "_" + wn;
                if (tmpl.indexOf(name) != -1 && !(name in data)) {
                    data[name] = function() {
                        return fn.call(this, self);
                    };
                }
            })();
        }
    }
}