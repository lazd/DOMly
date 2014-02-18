var cheerio = require('cheerio');

var variableRE = /\{\{(.*?)\}\}/g;
var blankRE = /^[\s]*$/;
var parentDataRE = /\.\.\//g;

function indent(spaces) {
  return (new Array(spaces)).join('\t');
}

function prettyPrint(node, spaces) {
  var isFirst = spaces === undefined;

  spaces = spaces || 0;

  var name = node.type === 'tag' ? node.name : 'text';
  var desc = '';

  if (node.type === 'text') {
    desc = node.data;
  }
  else {
    for (var attr in node.attribs) {
      desc += attr+'='+node.attribs[attr]+' ';
    }
  }

  if (!isFirst) {
    console.log(indent(spaces), name, desc);
  }

  if (node.children) {
    node.children.forEach(function(child) {
      prettyPrint(child, spaces+1);
    });
  }
}

function getVariableArray(string) {
  var array = [];
  var lastOffset = 0;

  string.replace(variableRE, function(match, p1, offset, string) {
    // Add intermediate text
    var text = string.slice(lastOffset, offset);
    if (text.length) {
      array.push(text);
    }

    // Add variables
    array.push({ variable: p1 });

    lastOffset = offset + match.length;

    return match;
  });

  // Add the last bit of text
  if (lastOffset !== string.length) {
    array.push(string.slice(lastOffset));
  }

  return array;
}

function isBlank(string) {
  return !!string.match(blankRE);
}

function safe(string) {
  return JSON.stringify(string);
}

function usesVariables(string) {
  return string.match(variableRE);
}

function Compiler(options) {
  this.data = this.data.bind(this);
  this.count = 0;
  this.nestCount = 0;
  this.options = options || {};
}

Compiler.prototype.createElement = function(elName, tag, elHandle) {
  var statement = 'var '+elName+' = ';
  var handleUsesDollar;
  var elHandleBare;
  var handleProperty;

  if (elHandle) {
    handleUsesDollar = elHandle.charAt(0) === '$';
    elHandleBare = handleUsesDollar ? elHandle.slice(1) : elHandle;
    handleProperty = 'this['+safe(elHandleBare)+']';
  }

  if (elHandle) {
    statement += handleProperty+' = ';
  }
  statement += 'document.createElement('+safe(tag)+');\n';

  if (elHandle && handleUsesDollar) {
    statement += 'this['+safe(elHandle)+'] = $('+elName+');\n';
  }

  return statement;
};

Compiler.prototype.setAttribute = function(elName, attr, value) {
  return elName+'.setAttribute('+safe(attr)+', '+this.makeVariableExpression(value)+');\n';
};

Compiler.prototype.setTextContent = function(elName, text) {
  return elName+'.textContent = '+this.makeVariableExpression(text)+';\n';
};

Compiler.prototype.createTextNode = function(elName, text) {
  return 'var '+elName+' = document.createTextNode('+this.makeVariableExpression(text)+');\n';
};

Compiler.prototype.makeVariableExpression = function(string) {
  if (!usesVariables(string)) {
    return safe(string);
  }

  var expression = '';
  var pieces = getVariableArray(string);
  for (var i = 0; i < pieces.length; i++) {
    var piece = pieces[i];

    // Concat pieces together
    if (i !== 0) {
      expression += '+';
    }

    if (typeof piece === 'string') {
      // Include text directly
      expression += safe(piece);
    }
    else {
      // Substitute variables
      expression += this.data(piece.variable);
    }
  }

  return expression;
};

Compiler.prototype.data = function(path) {
  if (path === 'this') {
    return 'data_'+this.nestCount;
  }

  path = path.replace(parentDataRE, '__template_parent_data__.');

  if (~path.indexOf('.')) {
    // Break into pieces
    var pieces = path.split('.');

    // Make path
    var expression;
    var i = 0;
    var piece;

    if (pieces[0] === '__template_parent_data__') {
      // Resolve variable name
      for (; i < pieces.length; i++) {
        if (pieces[i] !== '__template_parent_data__') {
          break;
        }
      }

      // Calculate correct variable name
      var parentNum = this.nestCount - i;
      expression = 'data_'+parentNum;
    }
    else {
      expression = 'data_'+this.nestCount;
    }

    for (; i < pieces.length; i++) {
      piece = pieces[i];
      if (piece === 'this' && i === 0) {
        // Skip initial this
        continue;
      }
      expression += '['+safe(piece)+']';
    }

    return expression;
  }
  else {
    return 'data_'+this.nestCount+'['+safe(path)+']';
  }
};

Compiler.prototype.buildFunctionBody = function(root, parentName) {
  var func = '';
  var text;
  var $ = this.$;

  for (var i = 0; i < root.children.length; i++) {
    var el = root.children[i];
    var elName = 'el'+(this.count++);

    if (el.type === 'tag') {
      // Process special tags
      if (el.name === 'if' || el.name === 'unless') {
        var not = (el.name === 'unless');

        // Find else statement
        var elseEl = $(el).children('else');
        if (elseEl.length) {
          $(elseEl).remove();
        }

        // Forward slash is an attribute delimiter
        // Join on / to re-add slashes from ../
        var expression = this.data(Object.keys(el.attribs).join('/'));

        if (not) {
          express = '!('+expression+')';
        }

        func += 'if ('+expression+') {\n';
        func += this.buildFunctionBody(el, parentName);
        func += '}\n';

        if (elseEl.length) {
          func += 'else {\n';
          func += this.buildFunctionBody(elseEl[0], parentName);
          func += '}\n';
        }

        continue;
      }
      else if (el.name === 'else') {
        throw new Error('Found <else> without <if>');
      }
      else if (el.name === 'foreach') {
        // Get the iterated object's name
        // @todo Throw if multiple items provided
        var iterated = this.data(Object.keys(el.attribs).join(''));

        // Increment nest count
        var pnc = this.nestCount;
        var nc = ++this.nestCount;
        var iteratedVar = 'iterated_'+nc;

        func += 'var '+iteratedVar+' = '+iterated+';\n';
        func += 'for (var i'+nc+' = 0, ni'+nc+' = '+iteratedVar+'.length; i'+nc+' < ni'+nc+'; i'+nc+'++) {\n';
        func += 'var data_'+nc+' = '+iteratedVar+'[i'+nc+'];\n';
        func += this.buildFunctionBody(el, parentName);
        func += '}\n';

        // Reset nest count
        this.nestCount = pnc;

        continue;
      }
      else {
        func += this.createElement(elName, el.name, el.attribs['data-handle']);

        var attrs = el.attribs;
        for (var attr in attrs) {
          // Skip internal handles
          if (attr === 'data-handle') {
            continue;
          }
          func += this.setAttribute(elName, attr, attrs[attr]);
        }

        var children = el.children;
        if (children.length === 1 && children[0].type === 'text') {
          text = $(el).text();

          if (!(this.options.stripWhitespace && isBlank(text)) || text.length) {
            // Set text content directly if there are no other children
            func += this.setTextContent(elName, text);
          }
        }
        else if (children.length) {
          func += this.buildFunctionBody(el, elName);
        }
      }
    }
    else if (el.type === 'text') {
      text = $(el).text();

      // Don't include blank text nodes
      if ((this.options.stripWhitespace && isBlank(text)) || !text.length) {
        continue;
      }

      func += this.createTextNode(elName, text);
    }

    if (parentName) {
      func += parentName+'.appendChild('+elName+');\n';
    }
  }

  return func;
};

Compiler.prototype.compile = function compile(html) {
  // Load the HTML inside of a root element
  var $ = this.$ = cheerio.load('<div id="__template_root__">'+html+'</div>', {
    lowerCaseAttributeNames: false
  });
  var root = $('#__template_root__')[0];

  if (this.options.debug) {
    console.log('\nSource file contents:');
    console.log(html);
    console.log('\nParsed tree:');
    prettyPrint(root);
  }

  // Reset count
  this.count = 0;
  this.nestCount = 0;

  // Build function body
  var functionBody = this.buildFunctionBody(root);

  if (root.children.length === 1) {
    // Return the root element, if there's only one
    functionBody += 'return el0;\n';
  }

  if (this.options.debug) {
    console.log('\nCompiled function:');
    console.log(functionBody);
  }

  return new Function('data_0', functionBody);
};

module.exports = function(html, options) {
  var compiler = new Compiler(options);
  return compiler.compile(html);
};
