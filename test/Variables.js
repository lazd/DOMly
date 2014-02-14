var expect = require('chai').expect;
var test = require('./lib/test.js');

describe('Variables', function() {
  it('should substitute variables', function() {
    test({
      fixture: 'List with variables',
      done: function($) {
        expect($('ul').attr('class')).to.equal('data1');
        expect($('li').get(0).textContent).to.equal('data1');
        expect($('li').get(1).textContent).to.equal('data1data2data3data4data5');
        expect($('li').get(2).textContent).to.equal('text1 data1 text2 data2 text3');
        expect($('li').get(3).textContent).to.equal('data1 text1 data2 text2');
        expect($('span').get(0).textContent).to.equal('data2');
        expect($('span').get(1).textContent).to.equal('data4');
      },
      data: {
        var1: 'data1',
        var2: 'data2',
        var3: 'data3',
        var4: 'data4',
        var5: 'data5'
      }
    });
  });
});
