suite('Variables', function() {
  var options = setup();

  benchmark('DOMly', function() {
    var result = document.getElementById('result');
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }

    result.appendChild(templates.Person(this.data));
  });

  if (!window.domlyOnly) {
    var HTMLBars = requireModule('htmlbars');
    var DOMHelper = requireModule('dom-helper').default;
    var domHelper = new DOMHelper();
    var hooks = requireModule('htmlbars-runtime').hooks;
    var helpers = requireModule('htmlbars-runtime').helpers;

    window.htmlbars_templates = window.htmlbars_templates || {};
    window.htmlbars_templates.Person = HTMLBars.compile(__html__['bench/fixtures/hbs/Person.hbs'])

    benchmark('HTMLbars', function() {
      var result = document.getElementById('result');
      while (result.firstChild) {
        result.removeChild(result.firstChild);
      }

      var frag = htmlbars_templates.Person.render(this.data, {
        hooks: hooks,
        helpers: helpers,
        dom: domHelper,
        useFragmentCache: true,
        canClone: true
      }, result);
      result.appendChild(frag);
    });

    benchmark('Handlebars', function() {
      var result = document.getElementById('result');
      result.innerHTML = hbs_templates.Person(this.data);
    });

    benchmark('doT', function() {
      var result = document.getElementById('result');
      result.innerHTML = dot_templates.Person(this.data);
    });

    benchmark('lodash', function() {
      var result = document.getElementById('result');
      result.innerHTML = lodash_templates.Person(this.data);
    });
  }
}, setup({
  name: 'Larry',
  title: 'Software Engineer',
  description: 'What can I say, I like to code!',
  email: 'lazdnet@gmail.com'
}));
