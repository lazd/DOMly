suite('Color list', function() {
  benchmark('DOMly', function() {
    var result = document.getElementById('result');
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }

    result.appendChild(templates.Complex(this.data));
  });

  if (!window.domlyOnly) {
    /*
    var HTMLBars = requireModule('htmlbars');
    var DOMHelper = requireModule('dom-helper').default;
    var domHelper = new DOMHelper();
    var hooks = requireModule('htmlbars-runtime').hooks;
    var helpers = requireModule('htmlbars-runtime').helpers;

    window.htmlbars_templates = window.htmlbars_templates || {};
    window.htmlbars_templates.Complex = HTMLBars.compile(__html__['bench/fixtures/hbs/Complex.hbs']);

    benchmark('HTMLBars', function() {
      var result = document.getElementById('result');
      while (result.firstChild) {
        result.removeChild(result.firstChild);
      }

      var frag = htmlbars_templates.Complex.render(this.data, {
        hooks: hooks,
        helpers: helpers,
        dom: domHelper,
        useFragmentCache: true,
        canClone: true
      }, result);
      result.appendChild(frag);
    });
    */

    benchmark('Handlebars', function() {
      var result = document.getElementById('result');
      result.innerHTML = hbs_templates.Complex(this.data);
    });

    benchmark('doT', function() {
      var result = document.getElementById('result');
      result.innerHTML = dot_templates.Complex(this.data);
    });

    benchmark('lodash', function() {
      var result = document.getElementById('result');
      result.innerHTML = lodash_templates.Complex(this.data);
    });
  }
}, setup({
  header: "Colors",
  items: [
    { name: "red", current: true, url: "#Red" },
    { name: "green", current: false, url: "#Green" },
    { name: "blue", current: false, url: "#Blue" }
  ],
  hasItems: true
}));
