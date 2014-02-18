// suite('Basic template with variables: append', function() {
//   var options = setup();

//   benchmark('ct', function() {
//     var result = document.getElementById('result');
//     result.appendChild(templates.Person({
//       name: 'Larry',
//       title: 'Software Engineer',
//       description: 'What can I say, I like to code!',
//       email: 'lazdnet@gmail.com'
//     }));
//   }, options);

//   benchmark('innerHTML', function() {
//     var result = document.getElementById('result');
//     result.innerHTML += __html__['bench/fixtures/Person.html'];
//   }, options);
// });

suite('Variables', function() {
  var options = setup();

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
});
