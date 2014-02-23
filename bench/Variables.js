suite('Variables', function() {
  var options = setup();

  benchmark('ATML', function() {
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
