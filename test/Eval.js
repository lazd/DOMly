var expect = require('chai').expect;
var test = require('./lib/test.js');

describe('Eval', function() {
  it('should support eval tags', function(done) {
    test({
      fixture: 'Eval',
      done: function($) {
        expect($('strong').length).to.equal(10);
        done();
      }
    });
  });

  it('should expose current data context as data', function(done) {
    test({
      fixture: 'Eval within for each',
      data: {
        items: [
          'Item 1',
          'Item 2',
        ]
      },
      done: function($) {
        expect($('strong')[0].textContent).to.equal('0: Item 1');
        expect($('strong')[1].textContent).to.equal('1: Item 2');
        expect($('strong')[2].textContent).to.equal('2: Item 3');
        done();
      }
    });
  });

  it('should allow reassignment of data', function(done) {
    test({
      fixture: 'Eval with reassignment',
      data: {
        name: 'Original'
      },
      done: function($) {
        expect($('h1').text()).to.equal('New');
        done();
      }
    });
  });

  it('should reset data context for eval after loop', function(done) {
    test({
      fixture: 'Eval with data after for each',
      data: {
        items: [{ name: 'Item 1' }, { name: 'Item 2' }]
      },
      done: function($) {
        expect($('span')[0].textContent).to.equal('');
        expect($('span')[1].textContent).to.equal('');
        done();
      }
    });
  });
});
