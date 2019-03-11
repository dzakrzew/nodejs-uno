var WebSocketServer = require('websocket').server;
var http = require('http');

const RoomCollection = require('./RoomCollection.js');
const Player = require('./Player.js');

class GameServer {
    constructor(port = 1337) {
        this._self = this;
        this.port = port;
        this.clients = [];
        this.rooms = new RoomCollection();
    }

    run() {
        var self = this;

        this.server = http.createServer(function(req, res) {});
        this.server.listen(this.port, function() {
            console.log('Server running at port ' + self.port);
        });

        this.wsServer = new WebSocketServer({
            httpServer: this.server
        });
        this.wsServer.on('request', function(request) {
            self.onRequest(self, request);
        });
    }

    sendMessage(connection, message) {
        connection.sendUTF(JSON.stringify(message));
    }

    onRequest(self, request) {
        let token = request.resourceURL.query.token;

        if (!this.clients.hasOwnProperty(token)) {
            let connection = request.accept(null, request.origin);
            self.clients[token] = connection;

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
    }

    onClose(token, connection) {
        this.rooms.playerLeft(token);
        delete this.clients[token];
    }

    handleMessage(token, connection, msg) {
        // join to room
        if (msg.action == 'join') {
            if (msg.nick.match(/^[A-Za-z0-9]+$/) == null) {
                this.sendMessage(connection, {
                    title: 'join-error',
                    message: 'INVALID-NICK'
                });
            }
            else {
                let player = new Player(connection, token, msg.nick);
                this.rooms.playerJoin(msg.room, player)
            }
        }

        // send chat message
        if (msg.action == 'chat-send') {
            this.rooms.chatSend(token, msg.text);
        }

        // play a specified card
        if (msg.action == 'play-card') {
            this.rooms.playCard(token, msg.card, msg.changeColor);
        }

        // perform some admin actions
        if (msg.action == 'op-action') {
            this.rooms.opAction(token, msg.opAction);
        }

        // draws one card
        if (msg.action == 'draw-card') {
            this.rooms.drawCard(token);
        }
    }
}

module.exports = GameServer;