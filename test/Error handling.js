var expect = require('chai').expect;
var test = require('./lib/test.js');

describe.skip('Error handling', function() {
  it('should pass variables to helpers', function() {
    test({
      fixture: 'Undefined global',
      done: function($) {
        expect(false).to.be.true;
        // expect($('body').text()).to.equal('Name');
      }
    });
  });
});

