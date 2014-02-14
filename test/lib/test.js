var path = require('path');
var fs = require('fs');
var compile = require('../../index.js');
var jsdom = require('jsdom');
var jquery = fs.readFileSync(path.join(__dirname, '..', '..', 'bower_components', 'jquery', 'jquery.js'), 'utf-8');

var html = '<html><head></head><body></body></html>';

function getFixture(name) {
  return fs.readFileSync(path.join(__dirname, '..', 'fixtures', name+'.html'), 'utf-8');
}

function test(options) {
  var fixture = getFixture(options.fixture);
  var template = compile(fixture, options.options);
  // console.log(template.toString());

  jsdom.env({
    html: html,
    src: [jquery],
    done: function (errors, window) {
      var document = global.document = window.document;
      var $ = global.$ = window.$;
      var root = template.call(options.obj, options.data);
      document.body.appendChild(root);

      options.done($, fixture, template, root, document, window);
    }
  });
}

module.exports = test;
