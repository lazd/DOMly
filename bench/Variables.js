suite('Variables', function() {
  var options = setup();

  window.htmlbars_templates = {
    Person: HTMLBars.compile(__html__['bench/fixtures/hbs/Person.hbs'])
  };

  benchmark('ct', function() {
    var result = document.getElementById('result');
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }

    result.appendChild(templates.Person({
      name: 'Larry',
      title: 'Software Engineer',
      description: 'What can I say, I like to code!',
      email: 'lazdnet@gmail.com'
    }));
  }, options);

  benchmark('HTMLbars', function() {
    var result = document.getElementById('result');
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }

    result.appendChild(htmlbars_templates.Person({
      name: 'Larry',
      title: 'Software Engineer',
      description: 'What can I say, I like to code!',
      email: 'lazdnet@gmail.com'
    }, { helpers: HTMLBars.helpers }));
  }, options);

  benchmark('Handlebars', function() {
    var result = document.getElementById('result');
    result.innerHTML = hbs_templates.Person({
      name: 'Larry',
      title: 'Software Engineer',
      description: 'What can I say, I like to code!',
      email: 'lazdnet@gmail.com'
    });
  }, options);

  benchmark('doT', function() {
    var result = document.getElementById('result');
    result.innerHTML = dot_templates.Person({
      name: 'Larry',
      title: 'Software Engineer',
      description: 'What can I say, I like to code!',
      email: 'lazdnet@gmail.com'
    });
  }, options);

  benchmark('lodash', function() {
    var result = document.getElementById('result');
    result.innerHTML = lodash_templates.Person({
      name: 'Larry',
      title: 'Software Engineer',
      description: 'What can I say, I like to code!',
      email: 'lazdnet@gmail.com'
    });
  }, options);
});
