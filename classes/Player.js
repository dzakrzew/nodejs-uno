class Player {
    constructor(connection, token, nick) {
        this.connection = connection;
        this.token = token;
        this.nick = nick;
    }

    sendMessage(message) {
        this.connection.sendUTF(JSON.stringify(message));
    }
}

module.exports = Player;