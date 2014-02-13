var cheerio = require('cheerio');

var count = 0;

var variableRE = /\{\{(.*?)\}\}/g;

function getVariableArray(string) {
	var array = [];
	var lastOffset = 0;
	string.replace(variableRE, function(match, p1, offset, string) {
		// Add intermediate text
		var text = string.slice(lastOffset, offset);
		if (text.length) {
			array.push(text);
		}

		array.push({ variable: p1 });

		lastOffset = offset + match.length;

		return match;
	});

	if (lastOffset !== string.length) {
		array.push(string.slice(lastOffset));
	}

	return array;
}

function makeVariableExpression(string) {
	if (!usesVariables(string)) {
		return safe(string);
	}

	var expression = '';
	var pieces = getVariableArray(string);
	pieces.forEach(function(piece, index) {
		if (index !== 0) {
			expression += '+';
		}

		if (typeof piece === 'string') {
			expression += safe(piece);
		}
		else {
			expression += 'data['+safe(piece.variable)+']';
		}
	});

	return expression;
}

function safe(string) {
	return JSON.stringify(string);
}

function getElName() {
	return 'el'+(count++);
}

function createElement(elName, tag, elHandle) {
	var statement = 'var '+elName+' = ';
	var handleUsesDollar;
	var handleProperty;
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
	statement += 'document.createElement("'+tag+'");\n';

	if (elHandle && handleUsesDollar) {
		statement += 'this['+safe(elHandle)+'] = $('+elName+');\n';
	}

	return statement;
}

function setAttribute(elName, attr, value) {
	return elName+'.setAttribute('+safe(attr)+', '+makeVariableExpression(value)+');\n'
}

function setTextContent(elName, text) {
	return elName+'.textContent = '+makeVariableExpression(text)+';\n';
}

function usesVariables(string) {
	return string.match(variableRE);
}

function createTextNode(elName, text) {
	return 'var '+elName+' = document.createTextNode('+makeVariableExpression(text)+');\n';
}

function buildFunctionBody($, el, parentName) {
	var func = '';

	el.children.forEach(function(el, index) {
		var elName = getElName();
		if (el.type === 'tag') {
			func += createElement(elName, el.name, el.attribs['data-handle']);

			var attrs = el.attribs;
			for (var attr in attrs) {
				// Skip internal handles
				if (attr === 'data-handle') {
					continue;
				}
				func += setAttribute(elName, attr, attrs[attr]);
			}

			var children = el.children;
			if (children.length) {
				func += buildFunctionBody($, el, elName);
			}
			else {
				var text = $(el).text();
				if (text.length) {
					// Set text content directly if there are no children
					func += setTextContent(elName, text);
				}
			}
		}
		else if (el.type === 'text') {
			var text = $(el).text();
			func += createTextNode(elName, text);
		}

		if (parentName) {
			func += parentName+'.appendChild('+elName+');\n';
		}
	});

	return func;
}

function compile(html) {
	var $ = cheerio.load('<div id="__template-root__">'+html+'</div>');

	var root = $('#__template-root__')[0];

	console.log(root);

	var functionBody = buildFunctionBody($, root);

	if (root.children.length === 1) {
		// Return the root element, if there's only one
		functionBody += 'return el0;\n';
	}

	return new Function('data', functionBody);
}

console.log(compile('<ul data-handle="$cow" class="{{var1}}"><li class="test1">Test1</li><li class="test2">Text {{var2}} text<a>anchortext</a></li></ul>').toString());
