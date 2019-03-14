var xAxis,
  yAxis,
  zAxis;

function handleOrientation(event) {
  xAxis = Number.parseFloat(event.beta);  // [-180,180]
  yAxis = Number.parseFloat(event.gamma); // [-90,90]
  zAxis = Number.parseFloat(event.alpha); // [0,360]
}
window.addEventListener('deviceorientation', handleOrientation);

window.addEventListener('load', function() {
  var form = document.getElementById("configForm");
  var xAxisLabel = document.getElementById("xAxis");
  var yAxisLabel = document.getElementById("yAxis");
  var zAxisLabel = document.getElementById("zAxis");
  var HOST = location.origin.replace(/^http/, 'ws')
  var ws = new WebSocket(HOST);

  form.addEventListener("submit", function(event) {
    event.preventDefault();
    var inputs = form.elements;
    var username = inputs['name'].value;

    for (var i = 0; i < inputs.length; i++) {
      inputs[i].setAttribute('disabled', '');
    };

    setInterval(function() {
      var wsMsg = {
        'id': username,
        'deviceData': {
          'xAxis': xAxis,
          'yAxis': yAxis,
          'zAxis': zAxis
        }
      };

      xAxisLabel.textContent = xAxis.toFixed(2);
      yAxisLabel.textContent = yAxis.toFixed(2);
      zAxisLabel.textContent = zAxis.toFixed(2);

      ws.send(JSON.stringify(wsMsg));
    }, 100);

    ws.onmessage = function (event) {
      var data = JSON.parse(event.data);
      console.log(data);
    }
  });
});
