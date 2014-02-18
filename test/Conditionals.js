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

  it('should support unless', function() {
    test({
      fixture: 'Unless statement',
      data: { second: true },
      done: function($) {
        expect($('p').length).to.equal(2);
      }
    });

    test({
      fixture: 'Unless statement',
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

  it('should set attributes conditionally', function() {
    var items = ['Item 1', 'Item 2'];

    test({
      fixture: 'Conditional attributes',
      data: { disabled: true, items: items },
      done: function($) {
        expect($('button#disabled').is(':disabled')).to.be.true;
        expect($('button#disabledWithClass').hasClass('disabledButton')).to.be.true;
        expect($('li').hasClass('disabledItem')).to.be.true;
        expect($('a').hasClass('enabledLink')).to.be.false;
      }
    });

    test({
      fixture: 'Conditional attributes',
      data: { disabled: false, items: items },
      done: function($) {
        expect($('button#disabled').is(':disabled')).to.be.false;
        expect($('button#disabledWithClass').hasClass('disabledButton')).to.be.false;
        expect($('li').hasClass('disabledItem')).to.be.false;
        expect($('a').hasClass('enabledLink')).to.be.true;
      }
    });
  });

  it('should support conditionals against parent value', function() {
    var items = [
      { name: 'Item 1' },
      { name: 'Item 2' }
    ];

    test({
      fixture: 'For each with nested parent conditional',
      data: {
        showItems: false,
        items: items
      },
      done: function($) {
        expect($('li').length).to.equal(0);
      }
    });

    test({
      fixture: 'For each with nested parent conditional',
      data: {
        showItems: true,
        items: items
      },
      done: function($) {
        expect($('li').length).to.equal(2);
      }
    });
  });
});
