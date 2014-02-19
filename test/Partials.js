var expect = require('chai').expect;
var test = require('./lib/test.js');
var getFixture = require('./lib/getFixture.js');
var compile = require('../index.js');

describe('Partials', function() {
  it('should pass current data context to partials if no arguments provided', function() {
    var data = { name: 'The Name', description: 'The description.' };
    test({
      fixture: 'Partial usage',
      data: data,
      globals: {
        partial: compile(getFixture('Partial'))
      },
      done: function($) {
        expect($('h1').text()).to.equal(data.name);
        expect($('p').text()).to.equal(data.description);
      }
    });
  });

  it('should pass arguments to partials', function() {
    var data = { info: { name: 'The Name', description: 'The description.' } };
    test({
      fixture: 'Partial usage with args',
      data: data,
      globals: {
        partial: compile(getFixture('Partial'))
      },
      done: function($) {
        expect($('h1').text()).to.equal(data.info.name);
        expect($('p').text()).to.equal(data.info.description);
      }
    });
  });
});
