suite('Markup', function() {
  benchmark('DOMly', function() {
    var result = document.getElementById('result');
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }

    result.appendChild(templates.Structure());
  });

  if (!window.domlyOnly) {
    window.htmlbars_templates = window.htmlbars_templates || {};
    window.htmlbars_templates.Structure = HTMLBars.compile(__html__['bench/fixtures/hbs/Structure.hbs'])

    benchmark('HTMLbars', function() {
      var result = document.getElementById('result');
      while (result.firstChild) {
        result.removeChild(result.firstChild);
      }

      result.appendChild(htmlbars_templates.Structure());
    });

    benchmark('Handlebars', function() {
      var result = document.getElementById('result');
      result.innerHTML = hbs_templates.Structure();
    });

    benchmark('doT', function() {
      var result = document.getElementById('result');
      result.innerHTML = dot_templates.Structure();
    });

    benchmark('lodash', function() {
      var result = document.getElementById('result');
      result.innerHTML = lodash_templates.Structure();
    });
  }
}, setup());
