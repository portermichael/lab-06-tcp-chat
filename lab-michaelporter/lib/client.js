'use strict';

let Client = module.exports = function (socket, nick) {
  this.socket = socket;
  this.nick = nick;
};
