'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

var store = { objs: [] }

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));

  ws.on('message', (data) => {
    console.log("message received: " + data)
    store.objs.push(data);
  });
});

setInterval(() => {
  wss.clients.forEach((client) => {
    var sample = store.objs[0];
    console.log("sending to clients: " + JSON.stringify(sample));

    // console.log("sending to clients: ", store);
    // client.send(JSON.stringify(store));

    if (sample) {
      client.send(JSON.stringify(sample));
    }

    store.objs = [];
  });
}, 1000);
