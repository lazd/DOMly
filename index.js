var cheerio = require('cheerio');
var inlineElements = require('./lib/elements-inline.js');

var variableRE = /\{\{\s*(.*?)\s*\}\}/g;
var blankRE = /^[\s]*$/;
var parentDataRE = /parent\./g;
var spaceSplitRE = /\s+/;
var argSplitRE = /\s*,\s*/;
var jsTagRE = /<js>/;
var invocationRE = /(.+)\((.*)\)$/;

function indent(spaces) {
  var space = '';
  while (spaces > 0) {
    space += '\t';
    spaces--;
  }
  return space;
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

    if (p1.slice(0,1) === '>') {
      // Helpers
      var args = p1.slice(1).split(spaceSplitRE);
      var helper = args.shift();
      if (args.length === 0) {
        args.push('this');
      }
      array.push({ helper: helper, args: args });
    }
    else {
      // Add variables
      array.push({ variable: p1 });
    }

    lastOffset = offset + match.length;

    return match;
  });

  // Add the last bit of text
  if (lastOffset !== string.length) {
    array.push(string.slice(lastOffset));
  }

  return array;
}

function isInline(el) {
  if (!el) {
    return false;
  }

  if (el.type === 'text') {
    return true;
  }

  return inlineElements.indexOf(el.name) !== -1;
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
  this.iteratorNames = [];
  this.options = options || {};
}

Compiler.prototype.createElement = function(elName, tag, elHandle) {
  var statement = 'var '+elName+' = ';
  var handleUsesDollar;
  var elHandleBare;

  if (elHandle) {
    handleUsesDollar = elHandle.charAt(0) === '$';
    elHandleBare = handleUsesDollar ? elHandle.slice(1) : elHandle;
    statement += 'this['+safe(elHandleBare)+']'+' = ';
  }
  statement += 'document.createElement('+safe(tag)+');';

  if (elHandle && handleUsesDollar) {
    statement += '\nthis['+safe(elHandle)+'] = $('+elName+');';
  }

  this.pushStatement(statement);
};

var conditionalAttrRE = /(if-|unless-)(.+)/;

Compiler.prototype.setAttribute = function(elName, attr, value) {
  var attrs = [];
  var conditionalAttrMatch = attr.match(conditionalAttrRE);
  if (conditionalAttrMatch) {
    var conditional = conditionalAttrMatch[1].slice(0, -1);
    var expression = this.data(conditionalAttrMatch[2]);

    if (conditional === 'unless') {
      expression = '!('+expression+')';
    }
    this.pushStatement('if ('+expression+') {');

    // Create a new HTML element
    // Load the HTML inside of a root element
    var $ = cheerio.load('<div '+value+'></div>', {
      lowerCaseAttributeNames: false
    });
    var newElement = $('div')[0];
    for (var newAttr in newElement.attribs) {
      attrs.push({ attr: newAttr, value: newElement.attribs[newAttr] });
    }
  }
  else {
    attrs.push({ attr: attr, value: value});
  }

  for (var i = 0; i < attrs.length; i++) {
    this.pushStatement(elName+'.setAttribute('+safe(attrs[i].attr)+', '+this.makeVariableExpression(attrs[i].value)+');');
  }

  if (conditionalAttrMatch) {
    this.pushStatement('}');
  }
};

Compiler.prototype.setTextContent = function(elName, text) {
  this.pushStatement(elName+'.textContent = '+this.makeVariableExpression(text)+';');
};

Compiler.prototype.createTextNode = function(elName, text) {
  this.pushStatement('var '+elName+' = document.createTextNode('+this.makeVariableExpression(text)+');');
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
      if (piece.variable) {
        // Substitute variables
        expression += this.data(piece.variable);
      }
      else if (piece.helper) {
        expression += piece.helper+'.call(this, '+piece.args.map(this.data).join(', ')+')';
      }
    }
  }

  return expression;
};

Compiler.prototype.data = function(path) {
  if (path === '') {
    return '';
  }

  if (path === 'this') {
    return 'data_'+this.nestCount;
  }

  // Match named iterators
  // This overrides property names
  var iteratorNameIndex = this.iteratorNames.indexOf(path);
  if (iteratorNameIndex !== -1) {
    return 'i'+(iteratorNameIndex+1);
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

      expression += this.handleInvocationPart(piece);
    }

    return expression;
  }
  else {
    return 'data_'+this.nestCount+this.handleInvocationPart(path);
  }
};

Compiler.prototype.handleInvocationPart = function(piece) {
  // @todo Replace this hacky bit of code with jison
  var invocationMatches = piece.match(invocationRE);
  if (invocationMatches) {
    var method = invocationMatches[1];
    var args = invocationMatches[2].split(',').map(this.data).join(',');
    return '['+safe(method)+']('+args+')';
  }
  else {
    return '['+safe(piece)+']';
  }
};

Compiler.prototype.buildFunctionBody = function(root, parentName) {
  var text;
  var $ = this.$;
  var isRoot = this.count === 0;

  for (var i = 0; i < root.children.length; i++) {
    var el = root.children[i];
    var elName = 'el'+(this.count++);

    // Process special tags
    if (el.name === 'helper') {
      var helperName = el.attribs.name;

      // Call the helper in the current context, passing processed text content
      this.pushStatement(parentName+'.appendChild(document.createTextNode('+helperName+'.call(this, '+this.makeVariableExpression($(el).text())+')));');
    }
    else if (el.name === 'partial') {
      var partialName = el.attribs.name;
      var args = el.attribs.args;

      // @todo Test this
      if (!partialName) {
        throw new Error('Partial name not specified');
      }

      // Pass current data if no args are defined
      if (!args) {
        args = 'this';
      }

      args = args.split(argSplitRE).map(this.data).join(', ');

      // Call the partial in the current context
      // Add the returned document fragment
      this.pushStatement(parentName+'.appendChild('+partialName+'.call(this, '+args+'));');
    }
    else if (el.name === 'js') {
      // Add literal JavaScript
      // @todo add support for define/update
      this.pushStatement($(el).text()+'');

      // Reset data
      this.pushStatement('data_'+this.nestCount+' = data;');
    }
    else if (el.name === 'if' || el.name === 'unless') {
      var not = (el.name === 'unless');

      // Find else statement
      var elseEl = $(el).children('else');
      if (elseEl.length) {
        $(elseEl).remove();
      }

      var expression = this.data(Object.keys(el.attribs).join(' '));

      if (not) {
        expression = '!('+expression+')';
      }

      this.pushStatement('if ('+expression+') {');
      this.indent++;
      this.buildFunctionBody(el, parentName);
      this.indent--;
      this.pushStatement('}');

      if (elseEl.length) {
        this.pushStatement('else {');
        this.indent++;
        this.buildFunctionBody(elseEl[0], parentName);
        this.indent--;
        this.pushStatement('}');
      }
    }
    else if (el.name === 'else') {
      throw new Error('Found <else> without <if>');
    }
    else if (el.name === 'foreach' || el.name === 'forin') {
      var attributeKeys = Object.keys(el.attribs);
      if (attributeKeys.length > 1) {
        throw new Error('Invalid arguments for '+el.name+' loop');
      }

      var isArray = el.name === 'foreach';
      var hasNamedIterator = false;
      var propName;

      if (attributeKeys.length) {
        var pair = attributeKeys.join('').split(',');
        propName = pair[0];
        this.iteratorNames.push(pair[1]);
        hasNamedIterator = true;
      }

      // Get the iterated object's name
      var iterated = this.data(propName);

      // Increment nest count
      var nc = ++this.nestCount;
      var iteratedVar = 'iterated_'+nc;

      // @todo handle update
      this.pushStatement('var '+iteratedVar+' = '+iterated+';');
      if (isArray) {
        this.pushStatement('for (var i'+nc+' = 0, ni'+nc+' = '+iteratedVar+'.length; i'+nc+' < ni'+nc+'; i'+nc+'++) {');
      }
      else {
        this.pushStatement('for (var i'+nc+' in '+iteratedVar+') {');
      }
      this.indent++;
      this.pushStatement('var data_'+nc+' = data = '+iteratedVar+'[i'+nc+'];');
      this.buildFunctionBody(el, parentName);
      this.indent--;
      this.pushStatement('}');

      if (hasNamedIterator) {
        this.iteratorNames.pop();
      }

      // Reset nest count
      --this.nestCount;
    }
    else {
      if (el.type === 'text') {
        text = $(el).text();

        // Don't include blank text nodes
        if ((this.options.stripWhitespace && isBlank(text)) || !text.length) {
          // Ignore whitespace between non-inline elements
          if (!isInline(el.prev) && !isInline(el.next)) {
            continue;
          }

          // When in stripWhitespace mode, use a single space if text is blank
          if (isBlank(text)) {
            text = ' ';
          }
        }

        this.createTextNode(elName, text);
      }
      else {
        this.createElement(elName, el.name, el.attribs.handle);

        var attrs = el.attribs;
        for (var attr in attrs) {
          // Skip internal handles
          if (attr === 'handle') {
            continue;
          }

          this.setAttribute(elName, attr, attrs[attr]);
        }

        var children = el.children;
        if (children.length === 1 && children[0].type === 'text') {
          text = $(el).text();

          if (!(this.options.stripWhitespace && isBlank(text)) || text.length) {
            // Set text content directly if there are no other children
            this.setTextContent(elName, text);
          }
        }
        else if (children.length) {
          this.buildFunctionBody(el, elName);
        }
      }

      if (parentName) {
        this.pushStatement(parentName+'.appendChild('+elName+');');
      }
      else {
        if (this.root !== elName) {
          // Store as a root element
          this.pushStatement(this.root+'.appendChild('+elName+');');
        }
      }
    }
  }

  // Return a list of root elements
  if (isRoot) {
    this.pushStatement('return '+this.root+';');
  }
};

Compiler.prototype.pushStatement = function(statement) {
  statement = indent(this.indent)+statement;
  this.statements.push(statement);
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

  // Reset vars
  this.mode = 'create';
  this.count = 0;
  this.statements = [];
  this.nestCount = 0;
  this.indent = 1;

  // Create a document fragment to hold the template
  if (root.children.length > 1) {
    this.root = 'frag';
    this.pushStatement('var frag = document.createDocumentFragment();');
  }
  else {
    this.root = 'el0';
  }

  // Tack a data declaration on so eval and foreach can use it
  this.pushStatement('var data;');

  // Ensure initial data is defined so eval can modify it
  if (html.match(jsTagRE)) {
    this.pushStatement('data = data_0 = typeof data_0 === "undefined" ? {} : data_0;');
  }

  // Build function body
  this.buildFunctionBody(root);

  var functionBody = this.statements.join('\n');

  if (this.options.debug) {
    console.log('\nCompiled function:');
    console.log(functionBody);
  }

  var func = new Function('data_0', functionBody);

  return func;
};

module.exports = function(html, options) {
  var compiler = new Compiler(options);
  return compiler.compile(html);
};
