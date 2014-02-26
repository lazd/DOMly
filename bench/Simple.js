suite('Variables', function() {
  var options = setup();

  window.htmlbars_templates = window.htmlbars_templates || {};
  window.htmlbars_templates.Person = HTMLBars.compile(__html__['bench/fixtures/hbs/Person.hbs'])

  benchmark('DOMly', function() {
    var result = document.getElementById('result');
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }

    result.appendChild(templates.Person(this.data));
  });

  benchmark('HTMLbars', function() {
    var result = document.getElementById('result');
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }

    result.appendChild(htmlbars_templates.Person(this.data, { helpers: HTMLBars.helpers }));
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
}, setup({
  name: 'Larry',
  title: 'Software Engineer',
  description: 'What can I say, I like to code!',
  email: 'lazdnet@gmail.com'
}));
