'use strict';

const net = require('net');
const server = net.createServer();
const Client = require('./lib/client.js');

let clientPool = [];

server.on('connection', (socket) => {
  let client = new Client();
  client.nickname = `guest_${Math.floor(Math.random() * 1000)}`;
  clientPool = [...clientPool, socket];
  let disconnect = (err) => {
    if (err) return console.error(err);
    clientPool = clientPool.filter((item) => item !== socket);
  };
  socket.on('error', disconnect);
  socket.on('close', disconnect);
  socket.on('data', (buffer) => {
    let data = buffer.toString();
    console.log(data);

    if (data.startsWith('/nick')) {
      socket.old = socket.nick;
      socket.nick = data.split('/nick ')[1] || socket.nick;
      socket.nick = socket.nick.trim();
      socket.write(`${socket.old} is now ${socket.nick}`);
      return;
    }

    if (data.startsWith('/dm')) {
      let splitData = data.split(' ') || '';
      let contact = splitData[1] || '';
      if (contact === '' || clientPool.indexOf(contact) === -1) {
        socket.write(`Slide into dms better ${socket.nick}`);
        return;
      }
      let content = splitData[2] || ` is typing...`;
      socket.write(`${socket.nick}: ${content}`);
    }

    if (data.startsWith('/troll')) {
      let funnyTroll = data.split(' ') || '';
      let timesTroll = funnyTroll[1] || '';
      let trollMsg = funnyTroll[2] || '';
      if (timesTroll === '' || typeof timesTroll !== 'number' || trollMsg === '' || timesTroll <= 0) {
        socket.write(`Nice try ${socket.nick}
                      Nice try ${socket.nick}
                      Nice try ${socket.nick}
                      `);
        for (let i = 0; i < timesTroll; i++) {
          socket.write(`${socket.nick}: ${trollMsg}`);
        }
      }
    }

    if (data === '/quit') {
      socket.write(`Bye ${socket.nick}`);
      socket.on('close', disconnect);
      return;
    }

    clientPool.forEach((item) => {
      item.write(`${socket.nick}: ${data}`);
    });
  });
});

server.listen(3000, () => {
  console.log('server up on port 3000');
});
