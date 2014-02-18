var expect = require('chai').expect;
var test = require('./lib/test.js');

describe('Forin loops', function() {
  var data = {
    name: 'Item',
    price: '500'
  };

  it('should support named iterators', function() {
    test({
      fixture: 'For in loop',
      data: data,
      done: function($) {
        expect($('li')[0].textContent).to.equal('name: Item');
        expect($('li')[1].textContent).to.equal('price: 500');
      }
    });
  });
});
