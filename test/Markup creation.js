var expect = require('chai').expect;
var test = require('./lib/test.js');

describe('Markup creation', function() {
  it('should create nested elements', function() {
    test('List', function($) {
      expect($('ul').length).to.equal(1);
      expect($('li').length).to.equal(2);
      expect($('li').get(0).textContent).to.equal('text1');
      expect($('li').get(1).textContent).to.equal('text2');
    });
  });

  it('should set element attributes', function() {
    test('List with attributes', function($) {
      expect($('ul').length).to.equal(1);
      expect($('ul').attr('id')).to.equal('list');
      expect($('ul').data('name')).to.equal('Main list');
      expect($('li').length).to.equal(2);
      expect($('li').get(0).textContent).to.equal('text1');
      expect($('li').get(0).className).to.equal('item1');
      expect($('li').get(1).textContent).to.equal('text2');
      expect($('li').get(1).className).to.equal('item2');
    });
  });
});
