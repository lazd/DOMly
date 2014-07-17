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

  it('should support statements in handles', function() {
    var obj = {};
    test({
      fixture: 'For each with handles',
      obj: obj,
      data: {
        name: 'MainList',
        tags: [
          'Tag 1',
          'Tag 2'
        ]
      },
      done: function($) {
        expect($('ul').get(0)).to.equal(obj.ul_MainList);
        expect($('li').get(0)).to.equal(obj.li_0);
        expect($('li').get(1)).to.equal(obj.li_1);
        expect(obj.$ul_MainList.is($('ul').get(0))).to.be.true;
        expect(obj.$li_0.is($('li').get(0))).to.be.true;
        expect(obj.$li_1.is($('li').get(1))).to.be.true;
      },
    });
  });

  it('should leave the handle attribute intact', function() {
    var obj = {};
    test({
      fixture: 'List with handles',
      obj: obj,
      options: {
        preserveHandleAttr: true
      },
      done: function($) {
        expect($('ul[handle="list"]').get(0)).to.equal(obj.list);
        expect($('li[handle="item1"]').get(0)).to.equal(obj.item1);
        expect($('li[handle="item2"]').get(0)).to.equal(obj.item2);
      },
    });
  });
});
