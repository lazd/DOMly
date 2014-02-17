var expect = require('chai').expect;
var test = require('./lib/test.js');

describe('Loops', function() {
  var data = {
    items: [{ name: 'Item 1' }, { name: 'Item 2' }]
  };

  it('should loop once for each item in set', function() {
    test({
      fixture: 'For each loop',
      data: data,
      done: function($) {
        expect($('li').length).to.equal(2);
      }
    });
  });

  it('should set data context for each item in set', function() {
    test({
      fixture: 'For each loop with data',
      data: data,
      done: function($) {
        expect($('li')[0].textContent).to.equal('Item 1');
        expect($('li')[1].textContent).to.equal('Item 2');
      }
    });
  });
});
