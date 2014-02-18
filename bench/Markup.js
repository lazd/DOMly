// suite('Basic template: append', function() {
//   var options = setup();

//   benchmark('ct', function() {
//     var result = document.getElementById('result');
//     result.appendChild(templates.Structure());
//   }, options);

//   benchmark('innerHTML', function() {
//     var result = document.getElementById('result');
//     result.innerHTML += __html__['bench/fixtures/Structure.html'];
//   }, options);
// });

suite('Markup', function() {
  var options = setup();

  benchmark('ct', function() {
    var result = document.getElementById('result');
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }

    result.appendChild(templates.Structure());
  }, options);

  benchmark('Handlebars', function() {
    var result = document.getElementById('result');
    result.innerHTML = hbs_templates.Structure();
  }, options);

  benchmark('doT', function() {
    var result = document.getElementById('result');
    result.innerHTML = dot_templates.Structure();
  }, options);
});
