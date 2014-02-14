var expect = require('chai').expect;
var test = require('./lib/test.js');

describe('Element handles', function() {
  it('should assign handles', function() {
    var obj = {};
    test({
      fixture: 'List with handles',
      obj: obj,
      done: function($) {
        expect($('ul').get(0)).to.equal(obj.list);
        expect($('li').get(0)).to.equal(obj.item1);
        expect($('li').get(1)).to.equal(obj.item2);
      }
    });
  });

  it('should assign jQuery handles', function() {
    var obj = {};
    test({
      fixture: 'List with jQuery handles',
      obj: obj,
      done: function($) {
        expect($('ul').get(0)).to.equal(obj.list);
        expect($('li').get(0)).to.equal(obj.item1);
        expect($('li').get(1)).to.equal(obj.item2);
        expect(obj.$list.is($('ul').get(0))).to.be.true;
        expect(obj.$item1.is($('li').get(0))).to.be.true;
        expect(obj.$item2.is($('li').get(1))).to.be.true;
      },
    });
  });
});
