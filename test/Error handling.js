var assert = require('chai').assert;
var test = require('./lib/test.js');

describe('Error handling', function() {
  it('should pass variables to helpers', function() {
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

