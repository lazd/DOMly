/* jshint -W098 */
var expect = require('chai').expect;
var test = require('./lib/test.js');

describe('Options', function() {
  describe('stripWhitespace', function() {
    it('should strip whitespace', function(done) {
      test({
        fixture: 'List',
        done: function($) {
          expect($('body').html()).to.equal('<ul><li>text1</li><li>text2</li></ul>');
          done();
        },
        options: {
          stripWhitespace: true
        }
      });
    });

    it('should not strip necessary whitespace', function(done) {
      test({
        fixture: 'Paragraph with whitespace',
        done: function($) {
          expect($('body').html()).to.equal('<div><p>Whitespace in individual text nodes <em>should</em> never<strong> be </strong>stripped. </p><p>Space <span>between inline elements</span> <span>should never be stripped.</span></p><p>However, space between block elements should be.</p></div>');
          done();
        },
        options: {
          stripWhitespace: true
        }
      });
    });

    it('should not strip whitespace from pre tags', function(done) {
      test({
        fixture: 'Preformatted text',
        done: function($) {
          expect($('pre').text()).to.equal('\nThis   is   preformated   text.\nIt   should   remain   unmolested.\n');
          done();
        },
        options: {
          stripWhitespace: true
        }
      });
    });
  });

  it('should append classNames when options.appendClassNames is true', function(done) {
    test({
      fixture: 'Custom Elements - With class property',
      done: function($, fixture, template, templateString) {
        expect(templateString).to.have.string('el0.className += " myNewClass";');
        done();
      },
      options: {
        appendClassNames: true
      }
    });
  });

  it('should append classNames when options.appendClassNames is true with variables', function(done) {
    test({
      fixture: 'Custom Elements - With class property substitute',
      done: function($, fixture, template, templateString) {
        expect(templateString).to.have.string('el0.className += " "+data_0["className"];');
        done();
      },
      data: {
        className: 'myNewClass'
      },
      options: {
        appendClassNames: true
      }
    });
  });

  it('should strip comments by default', function(done) {
    test({
      fixture: 'Comments',
      done: function($, fixture, template, templateString) {
        expect(templateString).to.not.have.string('This is a comment');
        done();
      },
      data: {
        className: 'myNewClass'
      }
    });
  });

  it('should preserve comments when options.preserveComments is true', function(done) {
    test({
      fixture: 'Comments',
      done: function($, fixture, template, templateString) {
        expect(templateString).to.have.string('This is a comment');
        done();
      },
      data: {
        className: 'myNewClass'
      },
      options: {
        preserveComments: true
      }
    });
  });

  it('should strip comments when options.preserveComments is false', function(done) {
    test({
      fixture: 'Comments',
      done: function($, fixture, template, templateString) {
        expect(templateString).to.not.have.string('This is a comment');
        done();
      },
      data: {
        className: 'myNewClass'
      }
    });
  });

  it('should not create new elements when options.queryForHandleElements is set', function(done) {
    test({
      fixture: 'List with handles',
      done: function($, fixture, template, functionText, root, document, window) {
        var item1 = document.querySelector('[handle="item1"]');

        var frag = template.call(document.body);
        document.body.removeChild(document.querySelector('[handle="list"]'));

        document.body.appendChild(frag);

        expect(item1).to.equal(document.querySelector('[handle="item1"]'));
        done();
      },
      options: {
        obj: document,
        preserveHandleAttr: true,
        debug: true,
        queryForHandleElements: true
      }
    });
  });
});
