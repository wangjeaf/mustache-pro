
Mustache.__cache__.subTmpls = {};

function getSubTmplText(tmplId) {
    if (typeof jQuery != 'undefined') {
        return $('#' + tmplId).text();
    } else {
        var node = $(tmplId);
        if (!node) {
            return '';
        }
        var sub = node.innerText;
        return sub;
    }
}

function getInjectedSubTmpls(tmpl) {
    if (!tmpl || typeof tmpl != 'string') {
        return tmpl;
    }
    tmpl = tmpl.replace(INJECT_SUB_TMPL_REG, function(match, key, content) {
        Mustache.__cache__.subTmpls[key] = content;
        return '';
    });
    return tmpl;
}

function getScriptSubTmpls(tmpl) {
    tmpl = tmpl || '';
    // 支持include子模板
    tmpl = tmpl.replace(INCLUDE_SUB_TMPL_REG, function(a, tmplId) {
        var tmpl = Mustache.__cache__.subTmpls[tmplId];
        if (tmpl) {
            return tmpl;
        }
        // 如果不是mx-tmpl形式的子节点，则找script标签
        debugger;
        var sub = getSubTmplText(tmplId)
        return sub;
    });
    return tmpl;
}