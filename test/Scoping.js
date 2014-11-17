var expect = require('chai').expect;
var test = require('./lib/test.js');

describe('Scoping', function() {
  var menuData = require('./fixtures/data/Menu.json');

  it('should resolve the deepest instance of a variable when referencing scope', function() {
    test({
      fixture: 'For each loop with scope data access',
      data: menuData,
      options: {
        useScope: true
      },
      done: function($) {
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

  it('should resolve parent properties if child property is undefined when referencing scope', function() {
    test({
      fixture: 'For each loop with scope data access to undefined properties',
      data: {
        category: 'Furniture',
        items: [
          {
            name: 'Sofas'
          },
          {
            name: 'Tables'
          }
        ]
      },
      options: {
        useScope: true,
        stripWhitespace: true
      },
      done: function($) {
        expect($('h1').text()).to.equal('Furniture');

        expect($('li')[0].textContent).to.equal('Furniture: Sofas');
        expect($('li')[1].textContent).to.equal('Furniture: Tables');
      }
    });
  });

});
