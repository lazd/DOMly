var test = require('./lib/test.js');

describe('Error handling', function() {
  describe('on render', function() {
    it('should fail on render when an undefined variable is encountered', function(done) {
      test({
        throwOnRender: true,
        fixture: 'Undefined global',
        done: done
      });
    });
  });

  describe('on compile', function() {
    it('should fail when a malformed statement is encountered', function() {
      test({
        throwOnCompile: true,
        fixture: 'Malformed statement'
      });
    });

    it('should fail when a malformed statement is encountered', function() {
      test({
        throwOnCompile: true,
        fixture: 'Malformed block'
      });
    });

    it('should throw if parent is encountered outside of a loop', function() {
      test({
        throwOnCompile: true,
        fixture: 'Parent without loop'
      });
    });
  });
});

