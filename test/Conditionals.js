var expect = require('chai').expect;
var sinon = require('sinon');
var test = require('./lib/test.js');

describe('Conditionals', function() {
  it('should support if when conditional is true', function(done) {
    test({
      fixture: 'If statement',
      data: { second: true },
      done: function($) {
        expect($('p').length).to.equal(2);
        done();
      }
    });
  });

  it('should support if when conditional is false', function(done) {
    test({
      fixture: 'If statement',
      data: { second: false },
      done: function($) {
        expect($('p').length).to.equal(1);
        done();
      }
    });
  });

  it('should support unless when conditional is false', function(done) {
    test({
      fixture: 'Unless statement',
      data: { second: false },
      done: function($) {
        expect($('p').length).to.equal(2);
        done();
      }
    });
  });

  it('should support unless when conditional is true', function(done) {
    test({
      fixture: 'Unless statement',
      data: { second: true },
      done: function($) {
        expect($('p').length).to.equal(1);
        done();
      }
    });
  });

  it('should support if on methods', function(done) {
    var spy = sinon.spy();
    var data = {
      method: function() {
        spy();
        return false;
      }
    };

    test({
      fixture: 'If with method invocation',
      data: data,
      done: function($) {
        expect(spy.called).to.be.true;
        expect($('p').length).to.equal(0);
        done();
      }
    });
  });

  it('should support if on methods with arguments', function(done) {
    var spy = sinon.spy();
    var data = {
      args: {
        arg1: true,
        arg2: true,
      },
      method: function(arg1, arg2) {
        spy();
        return arg1 && arg2;
      }
    };

    test({
      fixture: 'If with method invocation and object arguments',
      data: data,
      done: function($) {
        expect(spy.called).to.be.true;
        expect($('p').length).to.equal(1);
        done();
      }
    });
  });

  it('should support if-else when conditional is true', function(done) {
    test({
      fixture: 'If-else statement',
      data: { first: true },
      done: function($) {
        expect($('p').text()).to.equal('First option');
        done();
      }
    });
  });

  it('should support if-else when conditional is false', function(done) {
    test({
      fixture: 'If-else statement',
      data: { first: false },
      done: function($) {
        expect($('p').text()).to.equal('Second option');
        done();
      }
    });
  });

  it('should support nested if-else', function(done) {
    test({
      fixture: 'If-else nested',
      data: { first: false, second: false },
      done: function($) {
        expect($('p').text()).to.equal('Third option');
        done();
      }
    });
  });

  it('should throw for when else given without if', function() {
    test({
      fixture: 'If-else else without if',
      throwOnCompile: true
    });
  });

  it('should throw for multiple else on a given if', function() {
    test({
      fixture: 'If-else multiple else',
      throwOnCompile: true
    });
  });

  it('should set attributes conditionally when conditional is true', function(done) {
    var items = ['Item 1', 'Item 2'];

    test({
      fixture: 'Conditional attributes',
      data: { disabled: true, items: items },
      done: function($) {
        expect($('button#disabled').is(':disabled')).to.be.true;
        expect($('button#disabledWithClass').hasClass('disabledButton')).to.be.true;
        expect($('li').hasClass('disabledItem')).to.be.true;
        expect($('a').hasClass('enabledLink')).to.be.false;
        done();
      }
    });
  });

  it('should set attributes conditionally when conditional is false', function(done) {
    var items = ['Item 1', 'Item 2'];

    test({
      fixture: 'Conditional attributes',
      data: { disabled: false, items: items },
      done: function($) {
        expect($('button#disabled').is(':disabled')).to.be.false;
        expect($('button#disabledWithClass').hasClass('disabledButton')).to.be.false;
        expect($('li').hasClass('disabledItem')).to.be.false;
        expect($('a').hasClass('enabledLink')).to.be.true;
        done();
      }
    });
  });

  it('should set attributes conditionally with data in attributes', function(done) {
    test({
      fixture: 'Conditional attributes with data in attributes',
      data: {
        disabled: true,
        disabledClass: 'customDisabledClass',
        attr: 'title',
        value: 'A title'
      },
      done: function($) {
        expect($('button#disabled').is(':disabled')).to.be.true;
        expect($('button#disabled').attr('class')).to.equal('customDisabledClass');
        expect($('button#disabled').attr('title')).to.equal('A title');
        done();
      }
    });
  });

  it('should set attributes conditionally with method invocation', function(done) {
    test({
      fixture: 'Conditional attributes with method invocation',
      data: { isDisabled: function() { return true; } },
      done: function($) {
        expect($('button#disabled').is(':disabled')).to.be.true;
        done();
      }
    });
  });

  it('should set attributes conditionally with method invocation and arguments', function(done) {
    test({
      fixture: 'Conditional attributes with method invocation and arguments',
      data: { isDisabled: function(arg1, arg2) { return arg1 && arg2; }, arg1: true, arg2: true },
      done: function($) {
        expect($('button#disabled').is(':disabled')).to.be.true;
        done();
      }
    });
  });

  it('should support conditionals against parent value', function(done) {
    var items = [
      { name: 'Item 1' },
      { name: 'Item 2' }
    ];

    test({
      fixture: 'For each with nested parent conditional',
      data: {
        showItems: true,
        items: items
      },
      done: function($) {
        expect($('li').length).to.equal(2);
        done();
      }
    });
  });
});
