var path = require('path');

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      dist: 'build/**',
      results: 'build/results/**'
    },
    jshint: {
      options: {
        evil: true,
        expr: true,
        unused: true,
        multistr: true,
        globals: {
          console: true,
          document: true
        }
      },
      main: 'index.js',
      tests: 'test/**/*.js',
      gruntfile: 'gruntfile.js'
    },
    simplemocha: {
      options: {
        timeout: 3000,
        ignoreLeaks: false,
        globals: ['$'],
        ui: 'bdd',
        reporter: 'spec'
      },
      main: {
        src: ['test/*.js']
      }
    },
    karma: {
      options: {
        singleRun: true,
        reporters: ['bench'],
        files: [
          'node_modules/perftacular/perftacular-*.js',
          'bower_components/handlebars/handlebars.runtime.js',
          'build/templates.js',
          'build/hbs_templates.js',
          'build/dot_templates.js',
          'bench/fixtures/*.html',
          'bench/lib/*.js',
          'bench/*.js'
          // 'bench/Basic template.js'
        ]
      },
      chrome: {
        browsers: ['Chrome']
      },
      firefox: {
        browsers: ['Firefox']
      },
      // Watch configuration
      watch: {
        background: true,
        reporters: ['progress']
      },
      // Single-run configuration for development
      single: {
        singleRun: true
      },
      // Single-run configuration for CI
      ci: {
        singleRun: true,
        coverageReporter: {
          type: 'lcov',
          dir: 'dist/results/coverage/'
        }
      }
    },
    compile: {
      options: {
        namespace: 'templates'
      },
      templates: {
        src: 'bench/fixtures/*.html',
        dest: 'build/templates.js',
      }
    },
    dot: {
      options: {
        namespace: 'dot_templates'
      },
      templates: {
        src: 'bench/fixtures/dot/*.dot',
        dest: 'build/dot_templates.js',
      }
    },
    handlebars: {
      options: {
        namespace: 'hbs_templates',
        processName: function(name) {
          return path.basename(name, '.html');
        }
      },
      templates: {
        src: 'bench/fixtures/*.html',
        dest: 'build/hbs_templates.js'
      }
    },
    watch: {
      jshint: {
        files: ['gruntfile.js'],
        tasks: ['jshint']
      },
      main: {
        files: [ 'index.js' ],
        tasks: [ 'jshint:main', 'karma:watch:run' ]
      },
      tests: {
        files: [ 'test/**/*.js' ],
        tasks: [ 'jshint:tests', 'mocha' ]
      },
      bench: {
        files: [ 'bench/**/*.js' ],
        tasks: [ 'jshint:bench', 'karma:watch:run' ]
      }
    }
  });

  grunt.loadTasks('tasks/');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.registerTask('build', [ 'jshint', 'compile', 'handlebars', 'dot' ]);
  grunt.registerTask('default', [ 'clean', 'build' ]);

  grunt.registerTask('bench', [ 'build', 'clean:results', 'karma:chrome', 'karma:firefox' ]);
  grunt.registerTask('bench:chrome', [ 'build', 'clean:results', 'karma:chrome' ]);
  grunt.registerTask('bench:firefox', [ 'build', 'clean:results', 'karma:firefox' ]);
  grunt.registerTask('test', [ 'simplemocha' ]);
  grunt.registerTask('dev', [ 'karma:watch:start', 'watch' ]);
};
