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

  form.addEventListener("submit", function(event) {
    event.preventDefault();
    var inputs = form.elements;

    var address = inputs['address'].value,
      port = inputs['port'].value,
      path = inputs['path'].value;


    var ws = new WebSocket("ws://" + address + ":" + port);
    // var port = new osc.WebSocketPort({
    //   url: "ws://" + address + ":" + port
    // });

    // port.open();

    setInterval(function() {
      var oscMsg = [xAxis, yAxis, zAxis];
      console.log("oscMsg: " + oscMsg);

      xAxisLabel.textContent = xAxis.toFixed(2);
      yAxisLabel.textContent = yAxis.toFixed(2);
      zAxisLabel.textContent = zAxis.toFixed(2);

      ws.send({ address: path, args: oscMsg });

    }, 1000);

    ws.onmessage = function(event){
      console.log(event.data);
    };

    for (var i=0; i < inputs.length; i++) {
      inputs[i].setAttribute('disabled', '');
    }
  });
});
