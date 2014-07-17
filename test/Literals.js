var expect = require('chai').expect;
var test = require('./lib/test.js');

describe('Literals', function() {
  it('should allow a double-quoted string literal as the only argument', function() {
    test({
      fixture: 'Literals - Double-quoted string',
      done: function($) {
        expect($('p').text()).to.equal('meow');
      },
      data: {
        passThrough: function(string) {
          return string;
        }
      }
    });
  });

  it('should allow a single-quoted string literal as the only argument', function() {
    test({
      fixture: 'Literals - Single-quoted string',
      done: function($) {
        expect($('p').text()).to.equal('meow');
      },
      data: {
        passThrough: function(string) {
          return string;
        }
      }
    });
  });

  it('should allow multiple double and single-quoted string as arguments', function() {
    test({
      fixture: 'Literals - Double and single-quoted string arguments',
      done: function($) {
        expect($('p').text()).to.equal('meowmoocluck');
      },
      data: {
        concat: function() {
          var string = '';
          for (var i = 0; i < arguments.length; i++) {
            string += arguments[i];
          }
          return string;
        }
      }
    });
  });

  it('should allow a number literal as the only argument', function() {
    test({
      fixture: 'Literals - Number',
      done: function($) {
        expect($('p').text()).to.equal('42');
      },
      data: {
        passThrough: function(string) {
          return string;
        }
      }
    });
  });

  it('should allow multiple number literals as arguments', function() {
    test({
      fixture: 'Literals - Numbers',
      done: function($) {
        expect($('p').text()).to.equal('-0.75');
      },
      data: {
        sum: function() {
          var total = 0;
          for (var i = 0; i < arguments.length; i++) {
            total += arguments[i];
          }
          return total;
        }
      }
    });
  });
});
