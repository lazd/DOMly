window.createTarget = function() {
  // Remove old target
  var result = document.getElementById('result');
  if (result) {
    result.parentNode.removeChild(result);
  }

  document.body.insertAdjacentHTML('beforeend', '<div id="result"></div>');
};

/* jshint -W054 */
window.setup = function(fileName) {
  var doSetHTML = new Function('createTarget();');

  return {
    setup: doSetHTML,
    onComplete: doSetHTML
  };
};
