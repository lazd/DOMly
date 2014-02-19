var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;
var compile = require('../../index.js');
var getFixture = require('./getFixture.js');
var jsdom = require('jsdom');
var jquery = fs.readFileSync(path.join(__dirname, '..', '..', 'bower_components', 'jquery', 'jquery.js'), 'utf-8');

var html = '<html><head></head><body></body></html>';

function test(options) {
  if (!options.options) {
    options.options = {};
  }

  // Shortcut to enable debugging
  if (options.debug) {
    options.options.debug = true;
  }

  var fixture = getFixture(options.fixture);

  if (options.throw) {
    return expect(function() {
      compile(fixture, options.options);
    }).to.Throw(Error);
  }

  var template = compile(fixture, options.options);

  jsdom.env({
    html: html,
    src: [jquery],
    done: function (errors, window) {
      var prop;
      // Set globals
      if (options.globals) {
        for (prop in options.globals) {
          global[prop] = options.globals[prop];
        }
      }

      var document = global.document = window.document;
      var $ = global.$ = window.$;
      var rootElements = template.call(options.obj, options.data);
      rootElements.forEach(function(element) {
        document.body.appendChild(element);
      });

      if (options.options.debug) {
        console.log('Output HTML:');
        console.log(document.body.innerHTML);
      }

      options.done($, fixture, template, root, document, window);

      // Unset globals
      if (options.globals) {
        for (prop in options.globals) {
          delete global[prop];
        }
      }
    }
  });
}

module.exports = test;
