var cheerio = require('cheerio');

var count = 0;

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
	return elName+'.setAttribute('+safe(attr)+', '+safe(value)+');\n'
}

function setTextContent(elName, text) {
	return elName+'.textContent = '+safe(text)+';\n'
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

	return new Function(functionBody);
}

console.log(compile('<div class="cow" data-handle="$cow"></div><ul id="fruits" data-handle="ul"><li class="test1">Test1</li><li class="test2">Test2</li></ul>').toString());
