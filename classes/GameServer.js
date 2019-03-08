var WebSocketServer = require('websocket').server;
var http = require('http');

const RoomCollection = require('./RoomCollection.js');
const Player = require('./Player.js');

class GameServer {

    constructor(port = 1337, debug = false) {
        this._self = this;
        this.port = port;
        this.debug = debug;
        this.clients = [];
        this.rooms = new RoomCollection();
    }

    run() {
        if (this.debug) {
            console.log('Running server...');
        }

        this.server = http.createServer(function(req, res) {});
        this.server.listen(this.port, function() {
            if (this.debug) {
                console.log('Server running at port ' + this.port);
            }
        });

        this.wsServer = new WebSocketServer({
            httpServer: this.server
        });

        var self = this;

        this.wsServer.on('request', function(request) {
            self.onRequest(self, request);
        });
    }

    appendClient(token, connection) {
        this.clients[token] = connection;
    }

    onRequest(self, request) {
        let token = request.resourceURL.query.token;

        if (this.clients.hasOwnProperty(token)) {
            console.log('Token collision token=' + token);
        }
        else {
            if (this.debug) {
                console.log('New connection with token=' + token);
            }

            let connection = request.accept(null, request.origin);

            self.appendClient(token, connection);

            connection.on('message', function(message) {
                self.onMessage(token, connection, message);
            });
        
            connection.on('close', function(conn) {
                self.onClose(token, conn);
            });
        }
    }

    onMessage(token, connection, message) {
        if (message.type == 'utf8') {
            var msg = JSON.parse(message.utf8Data);
            this.handleMessage(token, connection, msg);
        }
        else {
            if (this.debug) {
                console.log('Unrecognized message type');
            }
        }
    }

    onClose(token, connection) {
        if (this.debug) {
            console.log('User token=' + token + ' detached');
        }

        this.deleteClient(token, connection);
    }

    handleMessage(token, connection, msg) {
        switch(msg.action) {
            case 'join':
                if (msg.nick.match(/^[A-Za-z0-9]+$/) == null) {
                    this.sendMessage(connection, {
                        title: 'join-error',
                        message: 'INVALID-NICK'
                    });
                    break;
                }

                let player = new Player(connection, token, msg.nick);
                this.rooms.playerJoin(msg.room, player)
                break;
            case 'chat-send':
                this.rooms.chatSend(token, msg.text);
                break;
        }
    }

    deleteClient(token, connection) {
        this.rooms.playerLeft(token);

        delete this.clients[token];
    }

    sendMessage(connection, message) {
        connection.sendUTF(JSON.stringify(message));
    }
}

module.exports = GameServer;