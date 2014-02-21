var fs = require('fs');
var path = require('path');
var jison = require('jison');

// Generate a parser for the grammar
var grammar = fs.readFileSync(path.join(__dirname, 'grammar.jison'), 'utf8');

module.exports = new jison.Parser(grammar);
