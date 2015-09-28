var addIfSupport = (function() {

    function addIfSupport(template, data) {
        var ifs = getIfConditions(template);
        var key = "";
        for (var i = 0; i < ifs.length; i++) {
            key = "if(" + ifs[i] + ")";
            if (data[key]) {
                continue;
            } else {
                data[key] = buildRealIfFn(ifs[i]);
            }
        }
    }


    // 扩展出来的if操作符，不支持 {{if(a.b.c==1)}} 的判断
    // 原生Mustache就会过滤掉这种if，不进入function
    /**
      var msg = Mustache.to_html('{{a.b}} {{if(a.b=1)}}', {
        a: {
          b: '321'
        },
        'if(a.b=1)': function() {
          return 'fda'
        }
      });
      ==> msg一直都是321
       */

    // 支持的操作符：&& ||
    // 例如：{{#if(a==1||b==2&&c==3)}}{{/if(a==1||b==2&&c==3)}}
    function parseOperations(key, data) {
        // 三个以上=，在这里都是==
        key = key.replace(/===/g, '==');
        // 先处理 ||，有一个为true就够了
        var keys = key.split('||');
        var res;

        for (var i = 0; i < keys.length; i++) {
            res = getAndResult(keys[i], data);
            if (res) {
                return true;
            }
        }
        return false;
    }

    function getAndResult(key, data) {
        // 再处理&&，所有都要为true才行
        var keys = key.split('&&');
        var res;

        for (var i = 0; i < keys.length; i++) {
            res = getAtomResult(keys[i], data);
            if (!res) {
                return false;
            }
        }
        return true;
    }

    // 获得原子计算符的取值，例如：a==1或者a!=1等
    function getAtomResult(key, data) {
        var index = key.indexOf('!=');
        var operator;
        var equalFlag;
        if (index == -1) {
            key = key.split("==");
            operator = '=='
        } else {
            key = key.split('!=');
            operator = '!='
        }

        var ns = key[0].split("."),
            value = key[1],
            curData = data;
        // 去掉前后两个 " 或者 '，便于直接值比对
        value = value.replace(QUOTE_REG, '');
        for (var i = ns.length - 1; i > -1; i--) {
            var cns = ns.slice(i);
            var d = curData;
            try {
                for (var j = 0; j < cns.length - 1; j++) {
                    d = d[cns[j]];
                }
                var prop = cns[cns.length - 1];
                if (prop in d) {
                    var dataValue = d[prop].toString();
                    // should equal
                    if (operator == '==' && dataValue === value) {
                        return true;
                    }
                    // should not equal
                    if (operator == '!=' && dataValue !== value) {
                        return true;
                    }
                    return false;
                }
            } catch (err) {
                console.error(err);
            }
        }
        return false;
    }


    function buildRealIfFn(key) {
        var realFn = function() {
            return parseOperations(key, this);
        };
        return realFn;
    }



    function getIfConditions(template) {
        var gx = template.match(IF_REG);
        var ret = [];
        if (gx) {
            for (var i = 0; i < gx.length; i++) {
                ret.push(gx[i].match(IF_CLEANER)[1]);
            }
        }
        return ret;
    }

    return addIfSupport;
    
})();