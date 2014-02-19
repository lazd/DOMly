var fs = require('fs');
var path = require('path');

function getFixture(name) {
  return fs.readFileSync(path.join(__dirname, '..', 'fixtures', name+'.html'), 'utf-8');
}

module.exports = getFixture;
