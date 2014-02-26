suite('Color list', function() {
  benchmark('DOMly', function() {
    var result = document.getElementById('result');
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }

    result.appendChild(templates.Complex(this.data));
  });

  /*
  window.htmlbars_templates = {
    Complex: HTMLBars.compile(__html__['bench/fixtures/hbs/Complex.hbs'])
  };

  benchmark('HTMLBars', function() {
    var result = document.getElementById('result');
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }

    result.appendChild(htmlbars_templates.Complex(this.data, { helpers: HTMLBars.helpers }));
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
}, setup({
  header: "Colors",
  items: [
    { name: "red", current: true, url: "#Red" },
    { name: "green", current: false, url: "#Green" },
    { name: "blue", current: false, url: "#Blue" }
  ],
  hasItems: true
}));
