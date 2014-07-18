var cheerio = require('cheerio');
var inlineElements = require('./lib/elements-inline.js');
var parsers = require('./lib/parsers.js');

var variableRE = /\{\{\s*(.*?)\s*\}\}/g;
var blankRE = /^[\s]*$/;
var jsTagRE = /<js>/;
var conditionalAttrRE = /^(if-|unless-)(.+)/;

var customTags = [
  'if',
  'unless',
  'else',
  'foreach',
  'partial',
  'helper',
  'forin',
  'js'
];

// Attributes that are more performant to set as properties
var asProperties = {
  'class': 'className',
  'id': 'id',
  'href': 'href'
};

/*
Check if an htmlparser2 node is a real HTML element
*/
function isRealElement(node) {
  return node.type === 'tag' && !~customTags.indexOf(node.name);
}

function doEval(code) {
  try {
    return eval.call(null, code);
  } catch (err) {
    // Log the template code
    console.error(code);
    throw err;
  }
}

function hasConditionAttributesOrHandles(node) {
  var attrs = node.attribs;

  for (var attr in attrs) {
    if (attr.match(conditionalAttrRE) || attr === 'handle') {
      return true;
    }
  }

  return false;
}

function hasSubstitutions(node) {
  if (node.type === 'text') {
    return !!node.data.match(variableRE);
  }
  else {
    for (var attr in node.attribs) {
      if (node.attribs[attr].match(variableRE)) {
        return true;
      }
    }
  }

  return false;
}

function isFragCandidate(node) {
  if (~customTags.indexOf(node.name) || hasConditionAttributesOrHandles(node) || hasSubstitutions(node)) {
    return false;
  }

  if (node.children) {
    for (var i = 0; i < node.children.length; i++) {
      var child = node.children[i];
      if (!isFragCandidate(child)) {
        return false;
      }
    }
  }

  return true;
}

function indent(spaces) {
  var space = '';
  while (spaces > 0) {
    space += '  ';
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
  this.globalStatementFromNode = this.globalStatementFromNode.bind(this);

  this.options = options || {};
}

Compiler.prototype.createElement = function(elName, el, customElement) {
  var tag = el.name;
  var elHandle = el.attribs.handle;
  var statement = 'var '+elName+' = ';
  var handleUsesDollar;
  var elHandleStatementBare;

  if (elHandle) {
    handleUsesDollar = elHandle.charAt(0) === '$';
    elHandleStatementBare = this.makeVariableStatement(handleUsesDollar ? elHandle.slice(1) : elHandle);
    statement += 'this['+elHandleStatementBare+']'+' = ';
  }

  statement += 'document.createElement('+safe(tag);

  // Add second argument for custom element creation
  if (customElement) {
    statement += ','+safe(customElement);
  }

  statement += ');';

  if (elHandle && handleUsesDollar) {
    statement += '\nthis["$"+'+elHandleStatementBare+'] = $('+elName+');';
  }

  this.pushStatement(statement);
};

Compiler.prototype.createComment = function(elName, text) {
  var statement = 'var '+elName+' = document.createComment('+safe(text)+');';

  this.pushStatement(statement);
};

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
    var asProperty = asProperties[attrs[i].attr];
    if (attrs[i].attr === 'class' && this.options.appendClassNames) {
      this.pushStatement(elName+'.'+asProperty+' += '+this.makeVariableStatement(' '+attrs[i].value)+';');
    }
    else if (asProperty) {
      this.pushStatement(elName+'.'+asProperty+' = '+this.makeVariableStatement(attrs[i].value)+';');
    }
    else {
      // Process both the attribute and the value to allow statements in either
      this.pushStatement(elName+'.setAttribute('+this.makeVariableStatement(attrs[i].attr)+', '+this.makeVariableStatement(attrs[i].value)+');');
    }
  }

  if (conditionalAttrMatch) {
    this.pushStatement('}');
  }
};

Compiler.prototype.setTextContent = function(elName, text) {
  this.pushStatement(elName+'.textContent = '+this.makeVariableStatement(text)+';');
};

Compiler.prototype.createTextNode = function(elName, text) {
  this.pushStatement('var '+elName+' = document.createTextNode('+this.makeVariableStatement(text)+');');
};

Compiler.prototype.makeVariableStatement = function(string) {
  if (!usesVariables(string)) {
    return safe(string);
  }

  var statement = '';
  var pieces = parsers.text.parse(string);
  for (var i = 0; i < pieces.length; i++) {
    var piece = pieces[i];

    // Concat pieces together
    if (i !== 0) {
      statement += '+';
    }

    if (piece.type === 'content') {
      // Include text directly
      statement += safe(piece.value);
    }
    else if (piece.type === 'block') {
      // Substitute variables
      statement += this.data(piece.statement);
    }
  }

  return statement;
};

// @todo Rename to this.scopedStatement?
Compiler.prototype.data = function(path) {
  if (path === '') {
    return '';
  }

  if (path === 'data') {
    return 'data_'+this.nestCount;
  }

  // Match named iterators
  // This overrides property names
  var iteratorNameIndex = this.iteratorNames.indexOf(path);
  if (iteratorNameIndex !== -1) {
    return 'i'+(iteratorNameIndex+1);
  }

  var result = parsers.statement.parse(path);

  if (this.options.debug) {
    console.log('Parsed statement:', result);
  }

  // Break into pieces
  var statement = this.globalStatementFromNode(result);

  return statement;
};


Compiler.prototype.globalArgListStatementFromArgs = function(args) {
  return args.map(this.globalStatementFromNode).join(',');
};

Compiler.prototype.globalStatement = function(path, defaultArgs) {
  if (path === '') {
    throw new Error('Cannot create global statement, provided path is empty');
  }

  var result = parsers.statement.parse(path);

  if (this.options.debug) {
    console.log('Parsed statement:', result);
  }

  // Break into pieces
  var statement = this.globalStatementFromNode(result, defaultArgs);

  return statement;
};

Compiler.prototype.globalStatementFromNode = function(node, defaultArgs) {
  // Make path
  var statement = '';
  var i = 0;
  var piece;

  if (node.type === 'literal') {
    return node.value;
  }

  // Get the actual path from the invocation
  // invocation.path is a path object
  if (node.type === 'invocation') {
    node.path = node.path.path;
  }

  var pieces = node.path;

  if (pieces[0] === 'parent') {
    // Resolve variable name
    for (; i < pieces.length; i++) {
      if (pieces[i] !== 'parent') {
        break;
      }
    }

    // Calculate correct variable name
    var parentNum = this.nestCount - i;
    statement = 'data_'+parentNum;
  }

  for (; i < pieces.length; i++) {
    piece = pieces[i];
    if (piece === 'data' && i === 0) {
      // Correctly assign initial data
      statement = 'data_'+this.nestCount;
      continue;
    }
    else if (piece === 'this' && i === 0) {
      // Skip initial this
      statement = 'this';
      continue;
    }

    if (statement === '') {
      // Allow accessing of global variables
      statement += piece;
    }
    else {
      statement += '['+safe(piece)+']';
    }
  }

  if (node.type === 'invocation') {
    statement += '(';

    if (defaultArgs) {
      var arg = { type: 'literal', value: [defaultArgs] };
      node.args = node.args ? node.args.concat(arg) : [arg];
    }

    if (node.args) {
      // Args should be still be scoped
      statement += this.globalArgListStatementFromArgs(node.args);
    }
    statement += ')';
  }

  return statement;
};

Compiler.prototype.buildFunctionBody = function(root, parentName) {
  var text;
  var statement;
  var $ = this.$;
  var isRoot = this.count === 0;
  var hasParent = !!parentName;

  if (!hasParent) {
    parentName = this.root;
  }

  for (var i = 0; i < root.children.length; i++) {
    var el = root.children[i];

    if (el.type === 'comment' && !this.options.preserveComments) {
      // Skip comment nodes
      continue;
    }

    var elName = 'el'+(this.count++);

    // Process special tags
    if (el.name === 'helper') {
      // @todo handle block argument
      var blockArgument = this.makeVariableStatement($(el).text());

      statement = this.globalStatement(Object.keys(el.attribs).join(''), blockArgument);

      // Call the helper in the current context, passing processed text content
      this.pushStatement(parentName+'.appendChild(document.createTextNode('+statement+'));');
    }
    else if (el.name === 'partial') {
      statement = this.globalStatement(Object.keys(el.attribs).join(''), 'data_'+this.nestCount);

      // Call the partial in the current context
      // Add the returned document fragment
      // this.pushStatement(parentName+'.appendChild('+partialName+'.call(this, '+args+'));');
      this.pushStatement(parentName+'.appendChild('+statement+');');
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
        var foreachArg = attributeKeys.join('');

        var matches = foreachArg.match(/(.*),([\w\d_$]+)$/);
        if (matches) {
          propName = matches[1];
          this.iteratorNames.push(matches[2]);
          hasNamedIterator = true;
        }
        else {
          propName = foreachArg;
        }
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
      else if (el.type === 'tag') {
        // Pass the is attribute as the third argument
        // This tells createElement to handle custom elements
        this.createElement(elName, el, el.attribs.is);

        var attrs = el.attribs;
        for (var attr in attrs) {
          // Skip internal handles
          if (attr === 'handle' && !this.options.preserveHandleAttr) {
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
      else if (el.type === 'comment') {
        this.createComment(elName, el.data);
      }

      if (this.root !== elName) {
        // Store as a root element
        this.pushStatement(parentName+'.appendChild('+elName+');');
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

Compiler.prototype.precompile = function(html) {
  // Reset vars
  this.count = 0;
  this.iteratorNames = [];
  this.statements = [];
  this.nestCount = 0;
  this.indent = 1;
  this.hasCachedFrags = false;

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

  var templateIsFragCandidate = isFragCandidate(root);

  if (templateIsFragCandidate) {
    this.indent = 2;
  }

  if (root.children.length === 1 && isRealElement(root.children[0])) {
    // Use the root element
    this.root = 'el0';
  }
  else {
    // Create a document fragment to hold the template
    this.root = 'frag';
    this.pushStatement('var frag = document.createDocumentFragment();');
  }

  // Ensure initial data is defined so eval can modify it
  if (html.match(jsTagRE)) {
    this.pushStatement('var data = data_0 = typeof data_0 === "undefined" ? {} : data_0;');
  }
  else {
    // Tack a data declaration on so eval and foreach can use it
    this.pushStatement('var data = data_0;');
  }
  // Build function body
  this.buildFunctionBody(root);

  if (this.options.debug) {
    this.statements.unshift('console.log("Data:", data);');
  }

  if (this.options.debug > 1) {
    this.statements.unshift('console.log("Value of this:", this);');
  }

  var functionBody = this.statements.join('\n');

  if (this.options.debug) {
    console.log('\nCompiled function:');
    console.log(functionBody);
  }

  // Compile first to check for errors
  var func = new Function('data_0', functionBody);

  // Convert back to a string
  functionBody = func.toString();

  // Use cached document fragments if no subsitutions happen
  if (!this.options.noFrags && templateIsFragCandidate) {
    this.statements = [
      '(function() {',
      '  var frag;',
      functionBody,
      '  return function template() {',
      '    if (!frag) {',
      '      frag = anonymous();',
      '    }',
      '    return frag.cloneNode(true);',
      '  };',
      '}())'
    ];

    functionBody = this.statements.join('\n');
  }
  else {
    functionBody = '('+functionBody+')';
  }

  if (this.options.debug) {
    console.log('\nResult:');
    console.log(functionBody);
  }

  return functionBody;
};

Compiler.prototype.compile = function(html) {
  // Use an indirect call to eval so code is evaluated in the global scope
  return doEval(this.precompile(html));
};

module.exports = {
  compile: function(html, options) {
    var compiler = new Compiler(options);
    return compiler.compile(html);
  },
  precompile: function(html, options) {
    var compiler = new Compiler(options);
    return compiler.precompile(html);
  }
};
