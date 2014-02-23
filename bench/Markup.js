suite('Markup', function() {
  var options = setup();

  window.htmlbars_templates = {
    Structure: HTMLBars.compile(__html__['bench/fixtures/hbs/Structure.hbs'])
  };

  benchmark('ATML', function() {
    var result = document.getElementById('result');
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }

    result.appendChild(templates.Structure());
  }, options);

  benchmark('HTMLbars', function() {
    var result = document.getElementById('result');
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }

    result.appendChild(htmlbars_templates.Structure());
  }, options);

  benchmark('Handlebars', function() {
    var result = document.getElementById('result');
    result.innerHTML = hbs_templates.Structure();
  }, options);

  benchmark('doT', function() {
    var result = document.getElementById('result');
    result.innerHTML = dot_templates.Structure();
  }, options);

  benchmark('lodash', function() {
    var result = document.getElementById('result');
    result.innerHTML = lodash_templates.Structure();
  }, options);
});
