'use strict';

const net = require('net');
const server = net.createServer();
const Client = require('./lib/client.js');

let clientPool = [];

server.on('connection', (socket) => {
  let client = new Client(socket);

  clientPool = [...clientPool, client];

  clientPool.forEach(item => {
    item.socket.write(`Welcome ${client.nick}\n`);
  });

  let disconnect = (err) => {
    if (err) return console.error(err);
    clientPool = clientPool.filter((item) => item.socket !== client.socket);
    clientPool.forEach((item) => {
      item.socket.write(`Bye ${client.nick}\n`);
    });
  };

  socket.on('error', disconnect);
  socket.on('close', disconnect);
  socket.on('data', (buffer) => {
    let data = buffer.toString();
    console.log(data);

    if (data.startsWith('/nick')) {
      let oldNick = client.nick;
      client.nick = data.split(' ')[1] || client.nick;
      client.nick = client.nick.trim();
      if (client.nick === oldNick || client.nick === '') {
        client.nick = oldNick;
        socket.write(`${client.nick} Change your nick by typing "/nick newNick"\n`);
        return;
      }
      clientPool.forEach((item) => {
        item.socket.write(`${oldNick} is now ${client.nick}\n`);
      });
      return;
    }

    if (data.startsWith('/dm')) {
      let splitData = data.split(' ') || '';
      let contact = splitData[1];
      let content = splitData.slice(2).join(' ');
      if (contact === '' || content === '') {
        socket.write(`Slide into dms better ${client.nick} "/dm contact msg"\n`);
        return;
      }
      clientPool.forEach((item) => {
        if (contact == item.nick)
          item.socket.write(`${client.nick}: ${content}`);
      });
      return;
    }

    if (data.startsWith('/troll')) {
      let funnyTroll = data.split(' ') || '';
      let timesTroll = funnyTroll[1] || '';
      let trollMsg = funnyTroll.slice(2).join(' ') || '';
      for (let i = 0; i < timesTroll; i++) {
        clientPool.forEach((item) => {
          item.socket.write(`${client.nick}: ${trollMsg}`);
        });
      }
      return;
    }

    if (data == '/quit\r\n') {
      socket.end();
      return;
    }

    clientPool.forEach((item) => {
      item.socket.write(`${client.nick}: ${data}`);
    });
  });
});

server.listen(3000, () => {
  console.log('server up on port 3000');
});
