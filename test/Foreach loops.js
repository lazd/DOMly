var expect = require('chai').expect;
var test = require('./lib/test.js');

describe('Foreach loops', function() {
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

  it('should set allow iterator over return value of method invocation', function() {
    test({
      fixture: 'For each on return value of method invocation',
      data: {
        itemToSkip: 'Item 2',
        items:[
          'Item 1',
          'Item 2',
          'Item 3'
        ]
      },
      obj: {
        getItems: function(items, itemToSkip) {
          items = items.filter(function(item) {
            return item !== itemToSkip;
          });

          return items;
        }
      },
      done: function($) {
        expect($('li')[0].textContent).to.equal('0: Item 1');
        expect($('li')[1].textContent).to.equal('1: Item 3');
      }
    });
  });

  it('should set reference parent data with parent', function() {
    test({
      fixture: 'For each with parent reference',
      data: {
        name: 'Parent',
        items: data.items
      },
      done: function($) {
        expect($('li')[0].textContent).to.equal('Parent: Item 1');
        expect($('li')[1].textContent).to.equal('Parent: Item 2');
      }
    });
  });

  it('should allow reference of parent\'s parent', function() {
    test({
      fixture: 'For each with nested parent reference',
      data: {
        category: 'Category',
        items: [
          { name: 'Item 1', tags: ['Tag 1', 'Tag 2' ]},
          { name: 'Item 2', tags: ['Tag 3', 'Tag 4' ]}
        ]
      },
      done: function($) {
        expect($('ol > li > ul > li')[0].textContent).to.equal('Category: Item 1: Tag 1');
        expect($('ol > li > ul > li')[1].textContent).to.equal('Category: Item 1: Tag 2');
        expect($('ol > li > ul > li')[2].textContent).to.equal('Category: Item 1: Tag 1');
        expect($('ol > li > ul > li')[3].textContent).to.equal('Category: Item 1: Tag 2');
        expect($('ol > li > ul > li')[4].textContent).to.equal('Category: Item 2: Tag 3');
        expect($('ol > li > ul > li')[5].textContent).to.equal('Category: Item 2: Tag 4');
        expect($('ol > li > ul > li')[6].textContent).to.equal('Category: Item 2: Tag 3');
        expect($('ol > li > ul > li')[7].textContent).to.equal('Category: Item 2: Tag 4');
      }
    });
  });

  it('should set data to loop context', function() {
    test({
      fixture: 'For each loop over array of strings',
      data: {
        items: ['Item 1', 'Item 2']
      },
      done: function($) {
        expect($('li')[0].textContent).to.equal('Item 1');
        expect($('li')[1].textContent).to.equal('Item 2');
      }
    });
  });

  it('should set loop over sets at nested properties', function() {
    test({
      fixture: 'For each loop over nested set',
      data: {
        item: {
          tags: [{ tag: 'Tag 1' }, { tag: 'Tag 2' }]
        }
      },
      done: function($) {
        expect($('li')[0].textContent).to.equal('Tag 1');
        expect($('li')[1].textContent).to.equal('Tag 2');
      }
    });
  });

  it('should support named iterators', function() {
    test({
      fixture: 'For each with named iterator',
      data: {
        items: [
          {
            tags: [ 'Tag 1', 'Tag 2' ]
          },
          {
            tags: [ 'Tag 3', 'Tag 4' ]
          }
        ]
      },
      done: function($) {
        expect($('h1')[0].textContent).to.equal('0');
        expect($('h1')[1].textContent).to.equal('1');
        expect($('li')[0].textContent).to.equal('0.0');
        expect($('li')[1].textContent).to.equal('0.1');
        expect($('li')[2].textContent).to.equal('1.0');
        expect($('li')[3].textContent).to.equal('1.1');
      }
    });
  });
});
