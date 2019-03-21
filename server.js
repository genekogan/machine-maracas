'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');
const uuid = require('uuid');

const PORT = process.env.PORT || 3000;
const USERS_INTERVAL = process.env.USERS_INTERVAL || 200;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use(express.static(path.join(__dirname, 'public')))
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

var store = { users: {} };

wss.on('connection', (ws) => {
  ws.id = uuid.v4();
  console.log('Client connected: ' + ws.id);
  console.log('Total clients connected: ', wss.clients.length);

  ws.on('close', () => {
    console.log('Client disconnected: ' + ws.id);
    console.log('Total clients connected: ', wss.clients.length);
  });

  ws.on('message', (wsMsg) => {
    try {
      var msgJSON = JSON.parse(wsMsg);
      store.users[msgJSON.id] = { deviceData: msgJSON.deviceData, name: msgJSON.id };
    } catch(e) {
      console.log("Unexpected message: ");
      console.log(e)
      console.log(e.stack)
    }
  });
});

setInterval(() => {
  if (Object.keys(store.users).length) {
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(store));
    });
  }

  store.users = {};
}, USERS_INTERVAL);
