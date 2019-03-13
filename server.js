'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');
const uuid = require('uuid');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

var store = { users: [] }

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.id = uuid.v4();

  ws.on('close', () => console.log('Client disconnected'));

  ws.on('message', (data) => {
    store.users.push({ 'id': ws.id, deviceData: data });
  });
});

setInterval(() => {
  wss.clients.forEach((client) => {
    var sample = store.users[0];
    // console.log("sending to clients: " + JSON.stringify({ 'foo': sample }));
    // console.log("clients connected", wss.clients.map( c => c.id));
    console.log("store: ", store);

    // console.log("sending to clients: ", store);
    // client.send(JSON.stringify(store));

    if (sample) {
      // client.send(JSON.stringify({ 'foo': sample }));
      client.send(JSON.stringify(sample));
    }

    store.users = [];
  });
}, 1000);
