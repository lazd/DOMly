var path = require('path');
var compile = require('dot').template;

module.exports = function(grunt) {
  grunt.registerMultiTask('dot', 'Compile doT templates.', function() {
    var options = this.options({
      namespace: 'templates'
    });

    this.files.forEach(function(file) {
      var contents = file.src.filter(function(filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        }
        else {
          return true;
        }
      }).map(function(filepath) {
        // Read file
        var contents = grunt.file.read(filepath);

        // Compile
        var template = compile(contents);

        var name = path.basename(filepath, '.html');

        var output = 'this['+JSON.stringify(options.namespace)+']['+JSON.stringify(name)+'] = '+template.toString()+';\n';

        return output;
      }).join('\n');

      contents = 'this['+JSON.stringify(options.namespace)+'] = {};\n'+contents;

      // Write joined contents to destination filepath.
      grunt.file.write(file.dest, contents);

      // Print a success message.
      grunt.log.writeln('File "' + file.dest + '" created.');
    });
  });
};
