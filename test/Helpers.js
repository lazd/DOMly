var expect = require('chai').expect;
var test = require('./lib/test.js');

describe('Helpers', function() {
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
        expect($('div').text()).to.equal('Name');
      }
    });
  });

  it('should pass current data context to helper if no arguments provided', function() {
    test({
      fixture: 'Helper',
      data: { name: 'name' },
      globals: {
        capitalize: function(obj) {
          return obj.name.slice(0,1).toUpperCase()+obj.name.slice(1);
        }
      },
      done: function($) {
        expect($('div').text()).to.equal('Name');
      }
    });
  });

  it('should be passed a block', function() {
    test({
      fixture: 'Helper with block',
      data: { name: 'name' },
      globals: {
        capitalize: function(str) {
          return str.slice(0,1).toUpperCase()+str.slice(1);
        }
      },
      debug: true,
      done: function($) {
        expect($('div').text()).to.equal('The name is Name');
      }
    });
  });
});
