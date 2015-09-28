var addSubTmplSupport = (function() {

    var tmpls = Mustache.__cache__.subTmpls = {};

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
            tmpls[key] = content;
            return '';
        });
        return tmpl;
    }

    function getScriptSubTmpls(tmpl) {
        tmpl = tmpl || '';
        // 支持include子模板
        tmpl = tmpl.replace(INCLUDE_SUB_TMPL_REG, function(a, tmplId) {
            // 如果是sub-tmpl类型的字节点，直接用
            var tmpl = tmpls[tmplId];
            if (tmpl) {
                return tmpl;
            }
            // 如果不是sub-tmpl形式的子节点，则找script标签
            var sub = getSubTmplText(tmplId);
            tmpls[tmplId] = sub;
            return sub;
        });
        return tmpl;
    }

    function addSubTmplSupport(tmpl) {

        tmpl = getInjectedSubTmpls(tmpl);
        
        tmpl = getScriptSubTmpls(tmpl);

        return tmpl;
    }

    return addSubTmplSupport;
    
})();