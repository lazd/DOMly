/* jshint -W098 */
var expect = require('chai').expect;
var test = require('./lib/test.js');

describe('Custom elements', function() {
  it('should call createElement correctly when is attribute is present', function() {
    test({
      fixture: 'Custom Elements - is property',
      done: function($, fixture, template, templateString) {
        expect(templateString).to.have.string('document.createElement("button","custom-button");');
        expect(templateString).to.have.string('el0.setAttribute("is", "custom-button");');
      }
    });
  });
});
