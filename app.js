var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('heroku-logger');

var app = express();
const UDP_PORT = 7500;
const WEB_SOCKET_PORT = 8081;

var osc = require("osc"),
    WebSocket = require("ws");

var udp = new osc.UDPPort({
    remoteAddress: "127.0.0.1",
    remotePort: UDP_PORT
});

// inspired by osc.js UDP-browser example
// https://github.com/colinbdclark/osc.js-examples/tree/master/udp-browser

var getIPAddresses = function () {
  var os = require("os"),
    interfaces = os.networkInterfaces(),
    ipAddresses = [];

  for (var deviceName in interfaces){
    var addresses = interfaces[deviceName];

    for (var i = 0; i < addresses.length; i++) {
      var addressInfo = addresses[i];

      if (addressInfo.family === "IPv4" && !addressInfo.internal) {
        ipAddresses.push(addressInfo.address);
      }
    }
  }

  return ipAddresses;
};

udp.on("ready", function () {
  var ipAddresses = getIPAddresses();
  ipAddresses.forEach(function (address) {
    console.log("Local Network IP Address:", address);
  });
  console.log("Broadcasting OSC over UDP to", udp.options.remoteAddress + ", Port:", udp.options.remotePort);
});

udp.open();

var wss = new WebSocket.Server({
  port: WEB_SOCKET_PORT
});

wss.on("connection", function(ws) {
  logger.info("A Web Socket connection has been established!");
  console.log("A Web Socket connection has been established!");
  
  ws.on('message', function incoming(data) {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on('close', () => console.log('Client disconnected'));
});

// based off of standard express generator web server setup
// using EJS view engine

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
  res.render('index', { address: getIPAddresses()[0], port: WEB_SOCKET_PORT });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
