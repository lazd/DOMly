var expect = require('chai').expect;
var test = require('./lib/test.js');

describe('Conditionals', function() {
  it('should support if', function() {
    test({
      fixture: 'If statement',
      data: { second: true },
      done: function($) {
        expect($('p').length).to.equal(2);
      }
    });

    test({
      fixture: 'If statement',
      data: { second: false },
      done: function($) {
        expect($('p').length).to.equal(1);
      }
    });
  });

  it('should support if-else', function() {
    test({
      fixture: 'If-else statement',
      data: { first: true },
      done: function($) {
        expect($('p').text()).to.equal('First option');
      }
    });

    test({
      fixture: 'If-else statement',
      data: { first: false },
      done: function($) {
        expect($('p').text()).to.equal('Second option');
      }
    });
  });

  it('should support nested if-else', function() {
    test({
      fixture: 'If-else nested',
      data: { first: false, second: false },
      done: function($) {
        expect($('p').text()).to.equal('Third option');
      }
    });
  });

  it('should throw for when else given without if', function() {
    test({
      fixture: 'If-else else without if',
      throw: true
    });
  });

  it('should throw for multiple else on a given if', function() {
    test({
      fixture: 'If-else multiple else',
      throw: true
    });
  });
});
