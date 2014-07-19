module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: './',

    frameworks: ['benchmark'],

    // list of files / patterns to load in the browser
    files: [
      'bench/fixtures/hbs/*.hbs',
      'vendor/htmlbars-0.1.0.js',
      'bower_components/handlebars/handlebars.runtime.js',
      'bower_components/lodash/dist/lodash.js',
      'build/templates.js',
      'build/hbs_templates.js',
      'build/dot_templates.js',
      'build/lodash_templates.js',
      'bench/lib/*.js',
      'bench/*.js'
    ],

    // list of files to exclude
    exclude: [
    ],

    // use dots reporter, as travis terminal does not support escaping sequences
    // possible values: 'dots', 'progress'
    // CLI --reporters progress
    // reporters: ['progress', 'coverage', 'junit'],
    reporters: ['benchmark'],

    // web server port
    // CLI --port 9876
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    // CLI --colors --no-colors
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    // CLI --log-level debug
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    // CLI --auto-watch --no-auto-watch
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    // CLI --browsers Chrome,Firefox,Safari
    browsers: process.env.TRAVIS ? [ 'Firefox' ] : [
      'Chrome'
    ],

    preprocessors: {
      // Source files you want to generate coverage reports for
      // This should not include tests or libraries
      // These files will be instrumented by Istanbu
      'index.js': ['coverage'],
      '**/*.html': ['html2js'],
      '**/*.hbs': ['html2js']
    },

    // Configure the reporter
    coverageReporter: {
      type: 'html',
      dir: 'dist/results/coverage/'
    },

    junitReporter: {
      outputFile: 'dist/results/test-results.xml',
      suite: ''
    },

    // If browser does not capture in given timeout [ms], kill it
    // CLI --capture-timeout 5000
    captureTimeout: 120000,

    // Benchmarks might take some time to report back, so don't timeout quickly
    browserNoActivityTimeout: 120000,

    // Auto run tests on start (when browsers are captured) and exit
    // CLI --single-run --no-single-run
    // singleRun: false,
    singleRun: true,

    // report which specs are slower than 500ms
    // CLI --report-slower-than 500
    reportSlowerThan: 500
  });
};
