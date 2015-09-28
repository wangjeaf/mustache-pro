/*! mustache-pro - v0.2.3 - 2015-09-28 *//*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false Mustache: true*/

(function defineMustache (global, factory) {
  if (typeof exports === 'object' && exports) {
    factory(exports); // CommonJS
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory); // AMD
  } else {
    global.Mustache = {};
    factory(global.Mustache); // script, wsh, asp
  }
}(this, function mustacheFactory (mustache) {

  var objectToString = Object.prototype.toString;
  var isArray = Array.isArray || function isArrayPolyfill (object) {
    return objectToString.call(object) === '[object Array]';
  };

  function isFunction (object) {
    return typeof object === 'function';
  }

  function escapeRegExp (string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  }

  /**
   * Null safe way of checking whether or not an object,
   * including its prototype, has a given property
   */
  function hasProperty (obj, propName) {
    return obj != null && typeof obj === 'object' && (propName in obj);
  }

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var regExpTest = RegExp.prototype.test;
  function testRegExp (re, string) {
    return regExpTest.call(re, string);
  }

  var nonSpaceRe = /\S/;
  function isWhitespace (string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };

  function escapeHtml (string) {
    return String(string).replace(/[&<>"'\/]/g, function fromEntityMap (s) {
      return entityMap[s];
    });
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   */
  function parseTemplate (template, tags) {
    if (!template)
      return [];

    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace () {
      if (hasTag && !nonSpace) {
        while (spaces.length)
          delete tokens[spaces.pop()];
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags (tagsToCompile) {
      if (typeof tagsToCompile === 'string')
        tagsToCompile = tagsToCompile.split(spaceRe, 2);

      if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
        throw new Error('Invalid tags: ' + tagsToCompile);

      openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
    }

    compileTags(tags || mustache.tags);

    var scanner = new Scanner(template);

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(openingTagRe);

      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
          } else {
            nonSpace = true;
          }

          tokens.push([ 'text', chr, start, start + 1 ]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr === '\n')
            stripSpace();
        }
      }

      // Match the opening tag.
      if (!scanner.scan(openingTagRe))
        break;

      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      // Match the closing tag.
      if (!scanner.scan(closingTagRe))
        throw new Error('Unclosed tag at ' + scanner.pos);

      token = [ type, value, start, scanner.pos ];
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();

        if (!openSection)
          throw new Error('Unopened section "' + value + '" at ' + start);

        if (openSection[1] !== value)
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        compileTags(value);
      }
    }

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();

    if (openSection)
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

    return nestTokens(squashTokens(tokens));
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens (tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens (tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];

    var token, section;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
      case '#':
      case '^':
        collector.push(token);
        sections.push(token);
        collector = token[4] = [];
        break;
      case '/':
        section = sections.pop();
        section[5] = token[2];
        collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
        break;
      default:
        collector.push(token);
      }
    }

    return nestedTokens;
  }

  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner (string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function eos () {
    return this.tail === '';
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function scan (re) {
    var match = this.tail.match(re);

    if (!match || match.index !== 0)
      return '';

    var string = match[0];

    this.tail = this.tail.substring(string.length);
    this.pos += string.length;

    return string;
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function scanUntil (re) {
    var index = this.tail.search(re), match;

    switch (index) {
    case -1:
      match = this.tail;
      this.tail = '';
      break;
    case 0:
      match = '';
      break;
    default:
      match = this.tail.substring(0, index);
      this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context (view, parentContext) {
    this.view = view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }

  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function push (view) {
    return new Context(view, this);
  };

  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function lookup (name) {
    var cache = this.cache;

    var value;
    if (cache.hasOwnProperty(name)) {
      value = cache[name];
    } else {
      var context = this, names, index, lookupHit = false;

      while (context) {
        if (name.indexOf('.') > 0) {
          value = context.view;
          names = name.split('.');
          index = 0;

          /**
           * Using the dot notion path in `name`, we descend through the
           * nested objects.
           *
           * To be certain that the lookup has been successful, we have to
           * check if the last object in the path actually has the property
           * we are looking for. We store the result in `lookupHit`.
           *
           * This is specially necessary for when the value has been set to
           * `undefined` and we want to avoid looking up parent contexts.
           **/
          while (value != null && index < names.length) {
            if (index === names.length - 1)
              lookupHit = hasProperty(value, names[index]);

            value = value[names[index++]];
          }
        } else {
          value = context.view[name];
          lookupHit = hasProperty(context.view, name);
        }

        if (lookupHit)
          break;

        context = context.parent;
      }

      cache[name] = value;
    }

    if (isFunction(value))
      value = value.call(this.view);

    return value;
  };

  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer () {
    this.cache = {};
  }

  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function clearCache () {
    this.cache = {};
  };

  /**
   * Parses and caches the given `template` and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function parse (template, tags) {
    var cache = this.cache;
    var tokens = cache[template];

    if (tokens == null)
      tokens = cache[template] = parseTemplate(template, tags);

    return tokens;
  };

  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   */
  Writer.prototype.render = function render (template, view, partials) {
    var tokens = this.parse(template);
    var context = (view instanceof Context) ? view : new Context(view);
    return this.renderTokens(tokens, context, partials, template);
  };

  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function renderTokens (tokens, context, partials, originalTemplate) {
    var buffer = '';

    var token, symbol, value;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      value = undefined;
      token = tokens[i];
      symbol = token[0];

      if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate);
      else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate);
      else if (symbol === '>') value = this.renderPartial(token, context, partials, originalTemplate);
      else if (symbol === '&') value = this.unescapedValue(token, context);
      else if (symbol === 'name') value = this.escapedValue(token, context);
      else if (symbol === 'text') value = this.rawValue(token);

      if (value !== undefined)
        buffer += value;
    }

    return buffer;
  };

  Writer.prototype.renderSection = function renderSection (token, context, partials, originalTemplate) {
    var self = this;
    var buffer = '';
    var value = context.lookup(token[1]);

    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    function subRender (template) {
      return self.render(template, context, partials);
    }

    if (!value) return;

    if (isArray(value)) {
      for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
        buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
      }
    } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
      buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
    } else if (isFunction(value)) {
      if (typeof originalTemplate !== 'string')
        throw new Error('Cannot use higher-order sections without the original template');

      // Extract the portion of the original template that the section contains.
      value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

      if (value != null)
        buffer += value;
    } else {
      buffer += this.renderTokens(token[4], context, partials, originalTemplate);
    }
    return buffer;
  };

  Writer.prototype.renderInverted = function renderInverted (token, context, partials, originalTemplate) {
    var value = context.lookup(token[1]);

    // Use JavaScript's definition of falsy. Include empty arrays.
    // See https://github.com/janl/mustache.js/issues/186
    if (!value || (isArray(value) && value.length === 0))
      return this.renderTokens(token[4], context, partials, originalTemplate);
  };

  Writer.prototype.renderPartial = function renderPartial (token, context, partials) {
    if (!partials) return;

    var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null)
      return this.renderTokens(this.parse(value), context, partials, value);
  };

  Writer.prototype.unescapedValue = function unescapedValue (token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return value;
  };

  Writer.prototype.escapedValue = function escapedValue (token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return mustache.escape(value);
  };

  Writer.prototype.rawValue = function rawValue (token) {
    return token[1];
  };

  mustache.name = 'mustache.js';
  mustache.version = '2.1.2';
  mustache.tags = [ '{{', '}}' ];

  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function clearCache () {
    return defaultWriter.clearCache();
  };

  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function parse (template, tags) {
    return defaultWriter.parse(template, tags);
  };

  /**
   * Renders the `template` with the given `view` and `partials` using the
   * default writer.
   */
  mustache.render = function render (template, view, partials) {
    return defaultWriter.render(template, view, partials);
  };

  // This is here for backwards compatibility with 0.4.x.,
  /*eslint-disable */ // eslint wants camel cased function name
  mustache.to_html = function to_html (template, view, partials, send) {
    /*eslint-enable*/

    var result = mustache.render(template, view, partials);

    if (isFunction(send)) {
      send(result);
    } else {
      return result;
    }
  };

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

// extend Mustache
// - 支持renderer {{list_a}}
// - 支持if判断 {{#if(a==1)}}{{/if(a==1)}}
// - 支持if!判断 {{#if(a!=1)}}{{/if(a!=1)}}
// - 支持过滤器{{a | filter1 | filter2}}
// - 支持include子模板：{{#include-sub-tmpl-id}}
//    - 子模板可以来自{{#sub-tmpl-tmpl-id}}{{/sub-tmpl-tmpl-id}}
//    - 子模板也可以来自 <script type="text/tmpl" id="tmpl-id"></script>

var Mustache = mustache;

var FILTER_REG = /\{{2,3}([^\{]*?)\|(.*?)\}{2,3}/ig;
var FILTER_CLEANER = /^\{{2,3}|\}{2,3}$/g;
var IF_REG = /\{{2,3}[\^#]?if\((.*?)\)\}{2,3}?/ig;
var IF_CLEANER = /\{{2,3}[\^#]?if\((.*?)\)\}{2,3}?/i;
var FN_NAME_AND_PARAM_REG = /([^(]+)\((.*)\)/;
var QUOTE_REG = /^['"]|["']$/g;
var INJECT_SUB_TMPL_REG = /\{{2}#sub-tmpl-([^\}]+)\}{2}([\s\S]*?)\{{2}\/sub-tmpl(?:-\1)?\}{2}/gi;
var INCLUDE_SUB_TMPL_REG = /{{#include-(.+)}}/g;

var MIRROR_FN = function(val) {
    return val;
};

function $(id) {
    return document.getElementById(id);
}

function trim(str) {
    if (!str) {
        return str;
    }
    return str.replace(/^\s+|\s+$/g, '')
}

function extend(dest, src) {
    if (dest && src) {
        for (var prop in src) {
            if (src.hasOwnProperty(prop)) {
                dest[prop] = src[prop];
            }
        }
    }
}

Mustache.__cache__ = Mustache.__cache__ || {};
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

function addArrayIndexSupport(o, depth) {
    var k, v;
    for (k in o) {
        v = o[k];
        if (v instanceof Array) {
            insertArrayIndexProps(v);
        } else if (typeof(v) === "object" && depth < 5) {
            addArrayIndexSupport(v, depth + 1);
        }
    }
}

function insertArrayIndexProps(v) {
    for (var i = 0; i < v.length; i++) {
        var o = v[i];
        if (o !== null && typeof(o) === "object") {
            if (i === 0) {
                o.__first__ = true;
            } else if (i === (v.length - 1)) {
                o.__last__ = true;
            } else {
                o.__middle__ = true;
            }
            o.__index__ = i;
        }
    }
}

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

Mustache.__cache__.filters = {};

Mustache.registerFilter = function(obj) {
    extend(Mustache.__cache__.filters, obj);
};

function addFilterSupport(template, data) {
    var filters = getFilters(template);
    for (var i = 0, l = filters.length; i < l; i++) {
        key = trim(filters[i]);
        if (data[key]) {
            continue;
        } else {
            data[key] = buildRealFilterFn(filters[i]);
        }
    }
}

function getFilters(template) {
    var gx = template.match(FILTER_REG);
    var ret = [];
    if (gx) {
        for (var i = 0, l = gx.length; i < l; i++) {
            ret.push(gx[i].replace(FILTER_CLEANER, ''));
        }
    }
    return ret;
}


function getFilterResultData(value, fnName) {
    var originValue = value;
    var fnName = trim(fnName);
    var fnParams = undefined;
    if (fnName.indexOf('(') != -1) {
        var nameAndParams = fnName.match(FN_NAME_AND_PARAM_REG);
        fnName = nameAndParams[1];
        fnParams = trim(nameAndParams[2]);
        if (fnParams) {
            fnParams = fnParams.split(',');
        }
    }
    var fn = Mustache.__cache__.filters[fnName];
    if (!fn) {
        console.error('[Mustache] Filter:' + fnName + ' is not defined, please use Mustache.registerFilter(filters) to define it.');
        return value;
    }
    if (fnParams !== undefined) {
        var resultFn = fn.apply(this, fnParams || []);
        if (typeof resultFn != 'function') {
            console.error('[Mustache] Filter:' + fnName + ' should return a function.');
            fn = MIRROR_FN;
        } else {
            fn = resultFn;
        }
    }
    value = fn(value);
    if (typeof value == 'function') {
        console.error('[Mustache] Filter:' + fnName + ' returns a function, use like this: ' + fnName + '(a,b).');
        value = originValue;
    }
    return value;
}


function buildRealFilterFn(key) {
    // {{prop.value | number(2) | thousand | rmb}}
    key = key.split("|");
    var realFn = function() {
        var ns = key[0].split("."),
            fns = key.slice(1),
            curData = this;
        for (var i = ns.length - 1; i > -1; i--) {
            var cns = ns.slice(i);
            var d = curData;
            try {
                // 找到数据
                for (var j = 0; j < cns.length - 1; j++) {
                    d = d[cns[j]];
                }
                var prop = trim(cns[cns.length - 1]);
                if (prop in d) {
                    // 取出原始数据
                    var value = d[prop];
                    // 用filter处理原始数据
                    for (var k = 0; k < fns.length; k++) {
                        var res = getFilterResultData(value, fns[k]);
                        // 有返回值时才赋值
                        if (res !== undefined) {
                            value = res;
                        } else {
                            // 没有返回值，则提示：哥们儿，你写的这个filter竟然没有返回值
                            console.error('[Mustache] Filter: ' + fns[k] + ' no return data when value is ' + value + '.')
                        }
                    }
                    // 返回处理后的数据
                    return value;
                } else {
                    return '-'
                }
            } catch (err) {
                console.error(err);
            }
        }
        return '-';
    };
    return realFn;
}


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

var oldMustacheRender = Mustache.to_html;

Mustache.to_html = function(tmpl, data, partials, send) {
    data = data || {};
    if (typeof(data) === "object") {
        addArrayIndexSupport(data, 0);
    }

    tmpl = getInjectedSubTmpls(tmpl);
    
    tmpl = getScriptSubTmpls(tmpl);

    addRendererSupport(data, tmpl);
    addIfSupport(tmpl, data);
    addFilterSupport(tmpl, data);

    return oldMustacheRender.apply(Mustache, arguments);
}

Mustache.registerFilter({
    number: function(fixed) {
        fixed = fixed || 2;
        return function(value) {
          if (value == null) {
            return '-';
          }
          var value = parseFloat(value);
          if (isNaN(value)) {
            return '-';
          }
          return value.toFixed(fixed);
        }
    },
    percent: function(value) {
        return value * 100 + '%'
    },
    floatPercent: function(fixed) {
        fixed = fixed || 2;
        return function(value) {
          if (value == null) {
            return '-';
          }
          var value = parseFloat(value);
          if (isNaN(value)) {
            return '-';
          }
          return (value * 100).toFixed(fixed) + '%';
        }
    },
    rmb: function(value) {
        return "￥" + value;
    },
    doller: function(value) {
        return "$" + value;
    },
    thousand: function(value) {
        value += '';
        var thousandPeriod = /(\d{1,3})(?=(?:\d{3})+\.)/g;
        var thousand = /(\d{1,3})(?=(?:\d{3})+$)/g;
        var reg = value.indexOf('.') != -1 ? thousandPeriod : thousand;

        value = value.replace(reg, '$1,');
        return value;
    }
});


}));