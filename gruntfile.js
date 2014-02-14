var path = require('path');

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      dist: 'dist/**',
      results: 'dist/results/**'
    },
    jshint: {
      main: 'index.js',
      tests: 'test/**/*.js',
      gruntfile: 'gruntfile.js',
      options: {
        unused: true,
        multistr: true,
        globals: {
          console: true,
          document: true
        }
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
      templates: {
        options: {
          namespace: 'templates'
        },
        src: 'bench/fixtures/*.html',
        dest: 'build/templates.js',
      }
    },
    handlebars: {
      compile: {
        options: {
          namespace: 'hbs_templates',
          processName: function(name) {
            return path.basename(name, '.html');
          }
        },
        files: {
          'build/hbs_templates.js': ['bench/fixtures/*.html']
        }
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
  grunt.registerTask('build', [ 'jshint', 'compile' ]);
  grunt.registerTask('default', [ 'clean', 'build' ]);

  grunt.registerTask('bench', [ 'karma:chrome', 'karma:firefox' ]);
  grunt.registerTask('bench:chrome', [ 'compile', 'clean:results', 'karma:chrome' ]);
  grunt.registerTask('bench:firefox', [ 'compile', 'clean:results', 'karma:firefox' ]);
  grunt.registerTask('test', [ 'clean:results', 'karma:single' ]);
  grunt.registerTask('dev', [ 'karma:watch:start', 'watch' ]);
};
