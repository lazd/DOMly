var expect = require('chai').expect;
var test = require('./lib/test.js');

describe('Scoping', function() {
  var menuData = require('./fixtures/Menu data.json');
  it('should set the scope variable to an array', function() {
    test({
      fixture: 'For each loop with scope data access',
      data: menuData,
      options: {
        useScope: true,
        stripWhitespace: true
      },
      done: function($, fixture, template, functionText, root, document, window) {
        console.log(functionText);
        console.log(document.body.innerHTML);

        expect($('h1').text()).to.equal('Menu');
        expect($('p.outer').text()).to.equal('Menu description');

        expect($('h2')[0].textContent).to.equal('Item 1');
        expect($('p')[0].textContent).to.equal('Item 1 description');
        expect($('h2')[1].textContent).to.equal('Item 2');
        expect($('p')[1].textContent).to.equal('Item 2 description');

        expect($('ul.nested > li')[0].textContent).to.equal('Item 1.1');
        expect($('ul.nested > li')[1].textContent).to.equal('Item 1.2');
        expect($('ul.nested > li')[2].textContent).to.equal('Item 2.1');
        expect($('ul.nested > li')[3].textContent).to.equal('Item 2.2');
      }
    });
  });
});
