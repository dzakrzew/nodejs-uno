const Player = require('./Player');

class Room {
    constructor(id) {
        this.id = id;
        this.players = [];
    }

    playerJoin(player) {
        console.log('User token=' + player.token + ' joined to room=' + this.id)

        this.sendMessageToAll({
            title: 'player-joined',
            nick: player.nick
        });

        this.players.push(player);

        var roomPlayers = [];

        for (let i = 0; i < this.players.length; i++) {
            roomPlayers.push(this.players[i].nick);
        }

        player.sendMessage({
            title: 'join-ok',
            players: roomPlayers,
            roomId: this.id
        })
    }

    playerLeft(token) {
        let playerIndex, playerNick;
        
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].token == token) {
                playerIndex = i;
                playerNick = this.players[i].nick;
                break;
            }
        }

        this.players.splice(playerIndex, 1);

        this.sendMessageToAll({
            title: 'player-left',
            nick: playerNick
        });
    }

    getPlayerWithToken(token) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].token == token) {
                return this.players[i];
            }
        }

        return null;
    }

    sendMessageToAll(message) {
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].sendMessage(message);
        }
    }

    hasPlayerWithToken(token) {
        return this.getPlayerWithToken(token) != null;
    }

    hasPlayerWithNick(nick) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].nick == nick) {
                return true;
            }
        }

        return false;
    }

    chatSend(token, text) {
        let senderPlayer = this.getPlayerWithToken(token);

        console.log('New message from ' + senderPlayer.nick);
        this.sendMessageToAll({
            title: 'chat-message',
            nick: senderPlayer.nick,
            text: text
        });
    }
}

module.exports = Room;