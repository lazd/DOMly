/* jshint -W098 */
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
          expect($('body').html()).to.equal('<div><p>Whitespace in individual text nodes <em>should</em> never<strong> be </strong>stripped. </p><p>Space <span>between inline elements</span> <span>should never be stripped.</span></p><p>However, space between block elements should be.</p></div>');
        },
        options: {
          stripWhitespace: true
        }
      });
    });

    it('should not strip whitespace from pre tags', function() {
      test({
        fixture: 'Preformatted text',
        done: function($) {
          expect($('body').html()).to.equal('<pre>\nThis   is   preformated   text.\nIt   should   remain   unmolested.\n</pre>');
        },
        options: {
          stripWhitespace: true
        }
      });
    });

    it('should append classNames when options.appendClassNames is true', function() {
      test({
        fixture: 'Custom Elements - With class property',
        done: function($, fixture, template, templateString) {
          expect(templateString).to.have.string('el0.className += " myNewClass";');
        },
        options: {
          appendClassNames: true
        }
      });
    });

    it('should append classNames when options.appendClassNames is true with variables', function() {
      test({
        fixture: 'Custom Elements - With class property substitute',
        done: function($, fixture, template, templateString) {
          expect(templateString).to.have.string('el0.className += " "+data_0["className"];');
        },
        data: {
          className: 'myNewClass'
        },
        options: {
          appendClassNames: true
        }
      });
    });

    it('should strip comments by default', function() {
      test({
        fixture: 'Comments',
        done: function($, fixture, template, templateString) {
          expect(templateString).to.not.have.string('This is a comment');
        },
        data: {
          className: 'myNewClass'
        }
      });
    });

    it('should preserve comments when options.preserveComments is true', function() {
      test({
        fixture: 'Comments',
        done: function($, fixture, template, templateString) {
          expect(templateString).to.have.string('This is a comment');
        },
        data: {
          className: 'myNewClass'
        },
        options: {
          preserveComments: true
        }
      });

      test({
        fixture: 'Comments',
        done: function($, fixture, template, templateString) {
          expect(templateString).to.not.have.string('This is a comment');
        },
        data: {
          className: 'myNewClass'
        }
      });
    });
  });
});
