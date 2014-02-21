var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;
var compile = require('../../index.js');
var getFixture = require('./getFixture.js');
var jsdom = require('jsdom');
var jquery = fs.readFileSync(path.join(__dirname, '..', '..', 'bower_components', 'jquery', 'dist', 'jquery.js'), 'utf-8');

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

  if (options.throwOnCompile) {
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

      var frag;
      if (options.throwOnRender) {
        return expect(function() {
          frag = template.call(options.obj, options.data);
        }).to.Throw(Error);
      }
      else {
        frag = template.call(options.obj, options.data);
      }

      document.body.appendChild(frag);

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
