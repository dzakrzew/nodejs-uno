window.WebSocket = window.WebSocket || window.MozWebSocket;

var connection = new WebSocket('ws://localhost:1337/?token=T' + Math.round(Math.random()*10**10));

connection.onopen = function() {
    console.info('Connection opened');
    unoInit();
}
connection.onerror = function(error) {
    console.error(error);
    unoPageShow('no-connection');
}
connection.onclose = function() {
    unoPageShow('no-connection');
}

connection.onmessage = function(message) {
    try {
        var json = JSON.parse(message.data);
        console.log(json);
        unoHandleMessage(json);
    } catch (e) {
        console.warn(e);
    }
}

var $game = $('#game');
var joinErrors = {
    'NICK-ALREADY-USED': 'Nazwa użytkownika jest już zajęta',
    'TOKEN-ALREADY-USED': 'Nastąpiła kolizja sesji. Odśwież stronę',
    'INVALID-NICK': 'Nazwa użytkownika musi składać się z liter lub cyfr',
    'ROOM-FULL': 'Nie ma już wolnych miejsc w tym pokoju'
};
var players = [];
var currentNick;
var currentGameState; // WAITING, PLAYING, ENDED

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function sendMessage(data) {
    connection.send(JSON.stringify(data));
}

// handling received messages
function unoHandleMessage(message) {
    if (message.title == 'join-ok') {
        currentNick = message.nick;

        $('#game-room-id').text(message.roomId);
        unoPageShow('game');

        players = message.players;
        unoGameUpdatePlayers();

        unoSetTurn(message.currentTurnPlayerId, message.currentTurnPlayerNick);
        unoGameUpdateCards(message.cards);
        unoSetCurrentCard(message.currentCard);
        
        $('.game-state-window').hide();
        $('.game-state-window[data-game-state="' + message.gameState + '"]').show();
    }

    if (message.title == 'player-joined') {
        players.push(message.nick);
        unoGameUpdatePlayers();

        unoChatNotification(message.nick + ' has joined.');
    }

    if (message.title == 'player-left') {
        players.splice(players.indexOf(message.nick), 1);
        unoGameUpdatePlayers();

        unoChatNotification(message.nick + ' has left.');
    }

    if (message.title == 'chat-message') {
        unoChatMessageNew(message.nick, message.text);
    }

    if (message.title == 'join-error') {
        unoShowJoinError(message.message);
    }

    if (message.title == 'add-cards') {
        unoGameUpdateCards(message.cards, true);
    }

    if (message.title == 'set-current-card') {
        unoSetCurrentCard(message.card);
    }

    if (message.title == 'change-turn') {
        unoSetTurn(message.playerId, message.playerNick);
    }

    if (message.title == 'update-players-cards-count') {
        for (var i = 0; i < Object.keys(message.cardsCount).length; i++) {
            var currNick = Object.keys(message.cardsCount)[i];

            $('*[data-game-player-count-nick="' + currNick + '"]').text(message.cardsCount[currNick]);
        }
    }

    if (message.title == 'update-game-state') {
        $('.game-state-window').hide();
        $('.game-state-window[data-game-state="' + message.gameState + '"]').show();

        if (message.gameState == 'WAITING') {
            unoGameUpdateCards([]);
        }

        if (message.gameState == 'PLAYING') {
            unoGameUpdateCards(message.cards);
        }

        if (message.gameState == 'ENDED') {
            unoGameUpdateCards([]);
            $('#game-winner').text(message.winnerNick);
        }
    }
}

function unoSetTurn(playerId, playerNick) {
    $('#game-cards').addClass('turn-disable');

    if (playerNick == currentNick) {
        $('#game-cards').removeClass('turn-disable');
    }

    $('#game-current-player').text(playerNick);
}

function unoSetCurrentCard(card) {
    var cardColor = card.split(':')[0];
    var cardName = card.split(':')[1];

    $('.game-card').removeClass('game-card-disabled');
    $('.game-card').each(function() {
        var thisCardColor = $(this).attr('data-card-color');
        var thisCardName = $(this).text();

        if (cardColor != thisCardColor && cardName != thisCardName && thisCardColor != 's') {
            $(this).addClass('game-card-disabled');
        }
    });

    $('.game-state-window[data-game-state="PLAYING"]').attr('data-game-window-color', cardColor);
    $('#game-current-card').text(cardName);
}

function unoShowJoinError(message) {
    $('#start-alert').text(joinErrors[message]);
    $('#start-alert').fadeIn();
}

function unoChatMessageNew(nick, text) {
    var ts = moment().format('HH:mm:ss');
    var chatMessageLi = '<li class="msg"><span class="ts">' + ts + '</span><span class="n">' + escapeHtml(nick) + '</span><span class="t">' + escapeHtml(text) + '</span></li>';
    
    $('#game-chat > ul').append(chatMessageLi);
    $('#game-chat').scrollTop($('#game-chat').innerHeight());
}

function unoChatNotification(text) {
    var ts = moment().format('HH:mm:ss');
    var chatNotifyLi = '<li class="notify"><span class="ts">' + ts + '</span><span class="t">' + escapeHtml(text) + '</span></li>';
    
    $('#game-chat > ul').append(chatNotifyLi);
    $('#game-chat').scrollTop($('#game-chat').innerHeight());
}

function unoPageShow(page) {
    $('*[data-page]').hide();
    $('*[data-page="' + page + '"]').show();
}

function unoGameUpdateCards(cards, append = false) {
    if (!append) {
        $('#game-cards').html('');
    }

    var currentCardColor = $('.game-state-window[data-game-state="PLAYING"]').attr('data-game-window-color');
    var currentCardName = $('#game-current-card').text();

    for (var i = 0; i < cards.length; i++) {
        var cardColor = cards[i].split(':')[0];
        var cardName = cards[i].split(':')[1];

        var $newCard = $('<div class="game-card" data-card-color="' + cardColor + '">' + cardName  + '</div>');

        if (currentCardColor != cardColor && currentCardName != cardName) {
            $newCard.addClass('game-card-disabled');
        }

        $('#game-cards').append($newCard);
    }
}

function unoGameUpdatePlayers() {
    $('#game-players').html('');
    
    for (var i = 0; i < players.length; i++) {
        $('#game-players').append('<li data-player-nick="' + players[i] + '"><span class="n">' + players[i] + '</span><span class="c" data-game-player-count-nick="' + players[i] + '">0</span></li>');
    }

    unoGameUpdateOpButtons();
}

function unoGameUpdateOpButtons() {
    var op = $('#game-players li').first().attr('data-player-nick');
    
    if (currentNick == op) {
        $('#game-op-buttons').show();
    } else {
        $('#game-op-buttons').hide();
    }
}

function unoThrowCardEffect(cardEl) {
	var startTop = cardEl.offset().top;
	var startLeft = cardEl.offset().left;
	var targetTop = $('#game-window').offset().top + ($('#game-window').height() / 2);
	var targetLeft = $('#game-window').offset().left + ($('#game-window').width() / 2);

	cardEl.css({position: 'fixed', top: startTop, left: startLeft, 'z-index': 999, opacity: 1})
		.animate({top: targetTop, left: targetLeft, opacity: 0.1}, 'slow', function() { $(this).remove(); });
}

// bind events
function unoBindEvents() {
    $.contextMenu({
        selector: '#game-cards:not(.turn-disable) .game-card[data-card-color="s"]:not(.game-card-disabled)',
        callback: function(key, options) {
            var thisCardName = $(this).text();

            sendMessage({
                action: 'play-card',
                card: 's:' + thisCardName,
                changeColor: key
            });

            unoThrowCardEffect($(this));
        },
        trigger: 'left',
        items: {
            r: {name: 'Czerwony', className: 'context-card-r'},
            g: {name: 'Zielony', className: 'context-card-g'},
            b: {name: 'Niebieski', className: 'context-card-b'},
            y: {name: 'Żółty', className: 'context-card-y'},
        }
    })

    $('*[data-page="game"]').on('click', '#game-cards:not(.turn-disable) .game-card:not(.game-card-disabled):not([data-card-color="s"])', function() {
        var card = $(this).attr('data-card-color') + ':' + $(this).text();
        console.log(card);
        sendMessage({
            action: 'play-card',
            card: card
        });

        unoThrowCardEffect($(this));
    });

    $('button#game-draw-card').click(function(e) {
        e.preventDefault();

        sendMessage({
            action: 'draw-card'
        });
    });

    $('button[data-op-button]').click(function() {
        var action = $(this).attr('data-op-button');

        sendMessage({
            action: 'op-action',
            opAction: action
        });
    })

    $('*[data-page="start"] input').on('change keydown keyup keypress', function() {
        $('#start-alert').fadeOut();

        var nick = $('#start-nick').val();
        var roomId = $('#start-room-id').val();

        $('#start-connect').attr('disabled', nick.length == 0 || roomId.length == 0);
    });

    $('#start-connect').click(function(e) {
        e.preventDefault();
        var nick = $('#start-nick').val();
        var room = $('#start-room-id').val();

        sendMessage({
            action: 'join',
            nick: nick,
            room: room
        });
    });

    $('#game-chat-input').keypress(function(e) {
        if (e.keyCode == 13) {
            var text = $('#game-chat-input').val();

            if (text.length > 0 && text.length <= 100) {
                $(this).val('');
                sendMessage({
                    action: 'chat-send',
                    text: text
                });
            }
        }
    });
}

function unoInit() {
    unoPageShow('start');
    unoBindEvents();
}