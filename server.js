const GameServer = require('./classes//GameServer.js');

var gameServer = new GameServer(1337)
gameServer.run();