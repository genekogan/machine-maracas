'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');
const uuid = require('uuid');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use(express.static(path.join(__dirname, 'public')))
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

var store = { users: [] }

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.id = uuid.v4();

  ws.on('close', () => console.log('Client disconnected'));

  ws.on('message', (wsMsg) => {
    var msgJSON = JSON.parse(wsMsg);
    store.users.push({ 'id': msgJSON.id, deviceData: msgJSON.deviceData });
  });
});

setInterval(() => {
  wss.clients.forEach((client) => {
    if (store.users.length) {
      client.send(JSON.stringify(store));
    }

    store.users = [];
  });
}, 1000);
