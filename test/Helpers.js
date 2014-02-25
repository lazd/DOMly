var expect = require('chai').expect;
var test = require('./lib/test.js');

describe('Inline helpers', function() {
  it('should pass variables to helpers', function() {
    test({
      fixture: 'Helper with args',
      data: { name: 'name' },
      globals: {
        capitalize: function(str) {
          return str.slice(0,1).toUpperCase()+str.slice(1);
        }
      },
      done: function($) {
        expect($('body').text()).to.equal('Name');
      }
    });
  });

  it('should allow passing of current data context to helper', function() {
    test({
      fixture: 'Helper with data',
      data: { name: 'name' },
      globals: {
        capitalize: function(obj) {
          return obj.name.slice(0,1).toUpperCase()+obj.name.slice(1);
        }
      },
      done: function($) {
        expect($('body').text()).to.equal('Name');
      }
    });
  });

  it('should support sub-expressions', function() {
    test({
      fixture: 'Helper with sub-expression',
      globals: {
        capitalize: function(str) {
          return str.slice(0,1).toUpperCase()+str.slice(1);
        },
        lowercase: function(str) {
          return str.toLowerCase();
        }
      },
      data: {
        name: 'My Name'
      },
      done: function($) {
        expect($('body').text()).to.equal('My name');
      }
    });
  });
});

describe('Block helpers', function() {
  it('should be passed a block if no arguments provided', function() {
    test({
      fixture: 'Helper with block',
      data: { name: 'name' },
      globals: {
        capitalize: function(str) {
          return str.slice(0,1).toUpperCase()+str.slice(1);
        }
      },
      done: function($) {
        expect($('body').text()).to.equal('Name');
      }
    });
  });

  it('should support non-function helpers', function() {
    test({
      fixture: 'Helper with non-function',
      exec: function() {
        global.myHelper = 'Some text!';
      },
      done: function($) {
        delete global.myHelper;
        expect($('body').text()).to.equal('Some text!');
      }
    });
  });

  it('should be passed a block in addition to arguments', function() {
    test({
      fixture: 'Helper with block and args',
      data: {
        name: 'Larry',
        game: 'code'
      },
      globals: {
        concat: function() {
          return Array.prototype.reduce.call(arguments, function(prev, cur) {
            return prev += cur;
          });
        }
      },
      done: function($) {
        expect($('body').text()).to.equal('Larry is my name, code is my game');
      }
    });
  });
});
