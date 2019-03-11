class Player {
    constructor(connection, token, nick) {
        this.connection = connection;
        this.token = token;
        this.nick = nick;
        this.cards = [];
    }

    sendMessage(message) {
        this.connection.sendUTF(JSON.stringify(message));
    }

    addCards(cards) {
        for (let i = 0; i < cards.length; i++) {
            this.cards.push(cards[i]);
        }

        this.sendMessage({
            title: 'add-cards',
            cards: cards
        });
    }
}

module.exports = Player;