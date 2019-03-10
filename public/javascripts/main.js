
function handleOrientation(event) {
  x = event.beta;  // In degree in the range [-180,180]
  y = event.gamma; // In degree in the range [-90,90]
}

window.addEventListener('deviceorientation', handleOrientation);
window.addEventListener('load', function() {
  var form = document.getElementById("configForm");

  form.addEventListener("submit", function(event) {
    event.preventDefault();
    var inputs = form.elements;

    var address = inputs['address'].value,
      port = inputs['port'].value,
      path = inputs['path'].value;

    var port = new osc.WebSocketPort({
      url: "ws://" + address + ":" + port
    });

    port.open();

    setInterval(function() {
      console.log([x, y]);
      port.send({
        address: path,
        args: [x, y]
      });
    }, 1000);

    for (var i=0; i < inputs.length; i++) {
      inputs[i].setAttribute('disabled', '');
    }
  });
});
