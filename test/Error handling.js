var assert = require('chai').assert;
var test = require('./lib/test.js');

describe('Error handling', function() {
  describe('on render', function() {
    it('should fail on render when an undefined variable is encountered', function() {
      test({
        throwOnRender: true,
        fixture: 'Undefined global',
        done: function() {
          // Should never be reached
          assert.fail(null, null, 'Callback should not have been executed');
        }
      });
    });
  });

  describe('on compile', function() {
    it('should fail when a malformed statement is encountered', function() {
      test({
        throwOnCompile: true,
        fixture: 'Malformed statement',
        done: function() {
          // Should never be reached
          assert.fail(null, null, 'Callback should not have been executed');
        }
      });
    });

    it('should fail when a malformed statement is encountered', function() {
      test({
        throwOnCompile: true,
        fixture: 'Malformed block',
        done: function() {
          // Should never be reached
          assert.fail(null, null, 'Callback should not have been executed');
        }
      });
    });
  });
});

