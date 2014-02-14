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

suite('Basic template', function() {
  var options = setup();

  benchmark('ct', function() {
    var result = document.getElementById('result');
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }

    result.appendChild(templates.Structure());
  }, options);

  benchmark('innerHTML', function() {
    var result = document.getElementById('result');
    result.innerHTML = __html__['bench/fixtures/Structure.html'];
  }, options);
});
