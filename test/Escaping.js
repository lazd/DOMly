var expect = require('chai').expect;
var test = require('./lib/test.js');

describe('Escaping', function() {
  it('should support escaping curly braces', function() {
    test({
      fixture: 'Escaped curly braces',
      data: {
        name: 'Stacheman'
      },
      done: function() {
        var html = document.body.innerHTML;
        expect(html).to.contain('{{Outer with data}}');
        expect(html).to.contain('{{Nested with data}}');
        expect(html).to.contain('{{Nested}}');
      }
    });
  });
});
