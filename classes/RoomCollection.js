const Room = require('./Room.js');

class RoomCollection {
    constructor() {
        this.rooms = {}
    }

    playerJoin(roomId, player) {
        if (!this.rooms.hasOwnProperty(roomId)) {
            this.rooms[roomId] = new Room(roomId)
        }

        if (this.rooms[roomId].hasPlayerWithNick(player.nick)) {
            player.sendMessage({
                title: 'join-error',
                message: 'NICK-ALREADY-USED'
            });
        }
        else if (this.rooms[roomId].hasPlayerWithToken(player.token)) {
            player.sendMessage({
                title: 'join-error',
                message: 'TOKEN-ALREADY-USED'
            });
        }
        else {
            this.rooms[roomId].playerJoin(player);
        }
    }

    playerLeft(token) {
        for (let roomId in this.rooms) {
            if (this.rooms[roomId].hasPlayerWithToken(token)) {
                this.rooms[roomId].playerLeft(token);
            }
        }
    }

    chatSend(token, text) {
        for (let roomId in this.rooms) {
            if (this.rooms[roomId].hasPlayerWithToken(token)) {
                this.rooms[roomId].chatSend(token, text);
            }
        }
    }

    playCard(token, card, changeColor) {
        for (let roomId in this.rooms) {
            if (this.rooms[roomId].hasPlayerWithToken(token)) {
                this.rooms[roomId].playCard(token, card, changeColor);
            }
        }
    }

    opAction(token, action) {
        for (let roomId in this.rooms) {
            if (this.rooms[roomId].hasPlayerWithToken(token)) {
                this.rooms[roomId].opAction(token, action);
            }
        }
    }

    drawCard(token) {
        for (let roomId in this.rooms) {
            if (this.rooms[roomId].hasPlayerWithToken(token)) {
                this.rooms[roomId].drawCard(token);
            }
        }
    }
}

module.exports = RoomCollection;