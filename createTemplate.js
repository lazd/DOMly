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
	var variableMatches = value.match(variableRE);
	var expression;
	if (variableMatches) {
		expression = makeVariableExpression(value);
	}
	else {
		expression = safe(value);
	}
	return elName+'.setAttribute('+safe(attr)+', '+expression+');\n'
}

function setTextContent(elName, text) {
	var statement = elName+'.textContent = ';
	var variableMatches = text.match(variableRE);
	if (variableMatches) {
		statement += makeVariableExpression(text);
	}
	else {
		statement += safe(text);
	}
	statement += ';\n';
	return statement;
}

function buildFunctionBody($, $el, parentName) {
	var func = '';

	$el.each(function(index, el) {
		var $el = $(el);

		var elName = getElName();

		func += createElement(elName, el.name, $el.data('handle'));

		var attrs = el.attribs;
		for (var attr in attrs) {
			// Skip internal handles
			if (attr === 'data-handle') {
				continue;
			}
			func += setAttribute(elName, attr, attrs[attr]);
		}

		var children = $el.children();
		var text = $el.text();
		if (children.length) {
			func += buildFunctionBody($, $(children), elName);
		}
		else if (text != '') {
			func += setTextContent(elName, text);
		}

		if (parentName) {
			func += parentName+'.appendChild('+elName+');\n';
		}
	});

	return func;
}

function compile(html) {
	var $ = cheerio.load('<div id="__template-root__">'+html+'</div>');

	var $children = $('#__template-root__').children();

	var functionBody = buildFunctionBody($, $children);

	if ($children.length === 1) {
		// Return the root element, if there's only one
		functionBody += 'return el0;\n';
	}

	return new Function('data', functionBody);
}

console.log(compile('<ul data-handle="$cow" class="{{var1}}"><li class="test1">Test1</li><li class="test2">Text {{var2}} text</li></ul>').toString());
