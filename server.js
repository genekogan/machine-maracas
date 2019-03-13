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
    console.log("sending to clients: ", store);
    client.send(JSON.stringify({ objs: 'hello people, ' + wss.clients.length }));
    // client.send(JSON.stringify(store));
    store.objs = [];
  });
}, 1000);
