'use strict';

const net = require('net');
const server = net.createServer();
const Client = require('./lib/client.js');

let clientPool = [];

server.on('connection', (socket) => {
  let client = new Client(socket);
  client.nick = `guest_${Math.floor(Math.random() * 1000)}`;

  clientPool = [...clientPool, socket];

  clientPool.forEach((item) => {
    item.write(`Welcome ${client.nick}\n`);
  });

  let disconnect = (err) => {
    clientPool.forEach((item) => {
      item.write(`Bye ${client.nick}\n`);
    });
    if (err) return console.error(err);
    clientPool = clientPool.filter((item) => item !== socket);
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
      if (client.nick === oldNick || client.nick == '') {
        client.nick = oldNick;
        client.socket.write(`${client.nick} Change your nick by typing "/nick newNick"\n`);
        return;
      }
      clientPool.forEach((item) => {
        item.write(`${oldNick} is now ${client.nick}\n`);
      });
      return;
    }

    if (data.startsWith('/dm')) {
      let splitData = data.split(' ') || '';
      console.log(splitData, 'spltdata');
      let contact = splitData[1] || '';
      if (contact === '' || clientPool.indexOf(contact) === -1) {
        console.log('1contact', contact);
        socket.write(`Slide into dms better ${client.nick} "/dm contact msg"\n`);
        return;
      }
      let content = splitData.slice(2) || ` is typing...`;
      console.log('1content', content);
      clientPool.forEach((item) => {
        if (contact == item.nick)
          item.write(`${client.nick}: ${content}`);
      });
      return;
    }

    if (data.startsWith('/troll')) {
      let funnyTroll = data.split(' ') || '';
      let timesTroll = funnyTroll[1] || '';
      let trollMsg = funnyTroll.slice(2) || '';
      if (timesTroll === '' || typeof timesTroll !== 'number' || trollMsg === '' || timesTroll <= 0) {
        socket.write(`
                      Nice try ${client.nick}
                      Nice try ${client.nick}
                      "/troll number msg"
                      Nice try ${client.nick}
                      Nice try ${client.nick}
                      \n`);
        // return;
      }
      for (let i = 0; i < timesTroll; i++) {
        clientPool.forEach((item) => {
          item.write(`${client.nick}: ${trollMsg}`);
        });
      }
      return;
    }

    if (data == '/quit\r\n') {
      disconnect();
      client.socket.end();
      return;
    }

    clientPool.forEach((item) => {
      item.write(`${client.nick}: ${data}`);
    });
  });
});

server.listen(3000, () => {
  console.log('server up on port 3000');
});
