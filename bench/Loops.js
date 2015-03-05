suite('Loops', function() {
  benchmark('DOMly', function() {
    var result = document.getElementById('result');
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }

    result.appendChild(templates.TagList(this.data));
  });

  if (!window.domlyOnly) {
    /*
    var HTMLBars = requireModule('htmlbars');
    var DOMHelper = requireModule('dom-helper').default;
    var domHelper = new DOMHelper();
    var hooks = requireModule('htmlbars-runtime').hooks;
    var helpers = requireModule('htmlbars-runtime').helpers;

    window.htmlbars_templates = window.htmlbars_templates || {};
    window.htmlbars_templates.TagList = HTMLBars.compile(__html__['bench/fixtures/hbs/TagList.hbs']);

    benchmark('HTMLBars', function() {
      var result = document.getElementById('result');
      while (result.firstChild) {
        result.removeChild(result.firstChild);
      }

      var frag = htmlbars_templates.TagList.render(this.data, {
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
      result.innerHTML = hbs_templates.TagList(this.data);
    });

    benchmark('doT', function() {
      var result = document.getElementById('result');
      result.innerHTML = dot_templates.TagList(this.data);
    });

    benchmark('lodash', function() {
      var result = document.getElementById('result');
      result.innerHTML = lodash_templates.TagList(this.data);
    });
  }
}, setup({
  name: 'Category',
  tags: [
    'Tag 1',
    'Tag 2',
    'Tag 3',
    'Tag 4',
    'Tag 5',
  ]
}));
