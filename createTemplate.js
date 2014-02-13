var cheerio = require('cheerio');

var count = 0;

var variableRE = /\{\{(.*?)\}\}/;

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
		expression = 'data['+safe(variableMatches[1])+']';
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
		statement += 'data['+safe(variableMatches[1])+']';
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

console.log(compile('<div class="cow" data-handle="$cow"></div><ul id="fruits" class="{{variable}}" data-handle="ul"><li class="test1">Test1</li><li class="test2">{{var1}}</li></ul>').toString());
