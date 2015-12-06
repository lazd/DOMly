var expect = require('chai').expect;
var test = require('./lib/test.js');

describe('Markup creation', function() {
  it('should create nested elements', function(done) {
    test({
      fixture: 'List',
      done: function($) {
        expect($('ul').length).to.equal(1);
        expect($('li').length).to.equal(2);
        expect($('li').get(0).textContent).to.equal('text1');
        expect($('li').get(1).textContent).to.equal('text2');
        done();
      }
    });
  });

  it('should set element attributes', function(done) {
    test({
      fixture: 'List with attributes',
      done: function($) {
        expect($('ul').length).to.equal(1);
        expect($('ul').attr('id')).to.equal('list');
        expect($('ul').data('name')).to.equal('Main list');
        expect($('li').length).to.equal(2);
        expect($('li').get(0).textContent).to.equal('text1');
        expect($('li').get(0).className).to.equal('item1');
        expect($('li').get(1).textContent).to.equal('text2');
        expect($('li').get(1).className).to.equal('item2');
        done();
      }
    });
  });

  it('should not blow away whitespace or line breaks', function(done) {
    test({
      fixture: 'Paragraph with whitespace',
      done: function($, fixture) {
        expect($('body').html()).to.equal(fixture);
        done();
      }
    });
  });

  it('should render multiple root elements', function(done) {
    test({
      fixture: 'Multiple root elements',
      done: function($) {
        expect($('div').length).to.equal(1);
        expect($('p').length).to.equal(1);
        done();
      }
    });
  });

  it('should support boolean attributes', function(done) {
    test({
      fixture: 'Boolean attributes',
      done: function($) {
        expect($('input').is(':disabled')).to.equal(true);
        expect($('input').attr('booleanattr')).to.equal('');
        done();
      }
    });
  });

  it('should support script tags', function(done) {
    test({
      fixture: 'Script tag',
      done: function($) {
        var script = $('script')[0];
        expect(script.getAttribute('src')).to.equal('a.js');
        expect(script.getAttribute('async')).to.equal('');
        expect(script.textContent).to.equal("alert('Script!');");
        done();
      }
    });
  });

  it('should support style tags', function(done) {
    test({
      fixture: 'Style tag',
      done: function($) {
        var script = $('style')[0];
        expect(script.getAttribute('type')).to.equal('text/css');
        expect(script.textContent).to.equal('body { margin: 0; }');
        done();
      }
    });
  });
});
