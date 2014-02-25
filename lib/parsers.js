var fs = require('fs');
var path = require('path');
var jison = require('jison');

var grammar_statement = fs.readFileSync(path.join(__dirname, 'grammar-statement.jison'), 'utf8');
var grammar_text = fs.readFileSync(path.join(__dirname, 'grammar-text.jison'), 'utf8');

// Generate a parsers for the grammars
module.exports = {
	statement: new jison.Parser(grammar_statement),
	text: new jison.Parser(grammar_text)
};
