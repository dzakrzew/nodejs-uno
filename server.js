const GameServer = require('./classes//GameServer.js');

// don't forget to change server host in front/index.js
var gameServer = new GameServer(1337)
gameServer.run();