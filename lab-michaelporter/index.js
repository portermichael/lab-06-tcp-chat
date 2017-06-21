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
      // if (contact === '' || clientPool.indexOf(contact) === -1) {
      //   socket.write(`Slide into dms better ${client.nick} "/dm contact msg"\n`);
      //   return;
      // }
      let content = splitData.slice(2).join(' ');
      clientPool.forEach((item) => {
        if (contact == item.nick)
          item.socket.write(`${item.nick}: ${content}`);
      });
      return;
    }

    if (data.startsWith('/troll')) {
      let funnyTroll = data.split(' ') || '';
      let timesTroll = funnyTroll[1] || '';
      let trollMsg = funnyTroll.slice(2).join(' ') || '';
      // if (typeof timesTroll !== 'number' || trollMsg.length === 0 || timesTroll <= 0) {
      //   socket.write(`
      //                 Nice try ${client.nick}
      //                 Nice try ${client.nick}
      //                 "/troll number msg"
      //                 Nice try ${client.nick}
      //                 Nice try ${client.nick}
      //                 \n`);
      //   return;
      // }
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
