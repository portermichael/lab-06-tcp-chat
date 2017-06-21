'use strict';

module.exports = function (socket, nick) {
  this.socket = socket;
  this.nick = nick || `guest_${Math.floor(Math.random() * 1000)}`;
};
