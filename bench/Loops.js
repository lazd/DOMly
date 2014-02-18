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

suite('Loops', function() {
  var options = setup();
  var data = {
    name: 'Category',
    tags: [
      'Tag 1',
      'Tag 2',
      'Tag 3',
      'Tag 4',
      'Tag 5',
    ]
  };

  benchmark('ct', function() {
    var result = document.getElementById('result');
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }

    result.appendChild(templates.TagList(data));
  }, options);

  benchmark('Handlebars', function() {
    var result = document.getElementById('result');
    result.innerHTML = hbs_templates.TagList(data);
  }, options);

  benchmark('doT', function() {
    var result = document.getElementById('result');
    result.innerHTML = dot_templates.TagList(data);
  }, options);
});
