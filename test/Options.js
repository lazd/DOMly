var expect = require('chai').expect;
var test = require('./lib/test.js');

describe('Options', function() {
  describe('stripWhitespace', function() {
    it('should strip whitespace', function() {
      test({
        fixture: 'List',
        done: function($) {
          expect($('body').html()).to.equal('<ul><li>text1</li><li>text2</li></ul>');
        },
        options: {
          stripWhitespace: true
        }
      });
    });

    it('should not strip necessary whitespace', function() {
      test({
        fixture: 'Paragraph with whitespace',
        done: function($) {
          expect($('body').html()).to.equal('<div><p>This <em>sentence</em> contains<strong> necessary </strong>whitespace that should not be stripped. </p><p>However, the line breaks <span>between elements</span><span>will be blown away</span></p></div>');
        },
        options: {
          stripWhitespace: true
        }
      });
    });
  });
});
