window.createTarget = function() {
  // Remove old target
  var result = document.getElementById('result');
  if (result) {
    result.parentNode.removeChild(result);
  }

  // Add a new one
  result = document.createElement('div');
  result.id = 'result';
  document.body.appendChild(result);
};

window.setup = function(data) {
  return {
    setup: new Function('this.data = '+JSON.stringify(data)+'; window.createTarget();')
  };
};
