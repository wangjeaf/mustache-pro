
var oldMustacheRender = Mustache.to_html;

Mustache.to_html = function(tmpl, data, partials, send) {
    data = data || {};
    if (typeof(data) === "object") {
        addArrayIndexSupport(data, 0);
    }

    tmpl = addSubTmplSupport(tmpl);

    addRendererSupport(data, tmpl);
    addIfSupport(tmpl, data);
    addFilterSupport(tmpl, data);

    return oldMustacheRender.apply(Mustache, arguments);
}
