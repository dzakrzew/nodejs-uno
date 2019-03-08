window.WebSocket = window.WebSocket || window.MozWebSocket;

var connection = new WebSocket('ws://127.0.0.1:1337/?token=T' + Math.round(Math.random()*10**10));

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

function sendMessage(data) {
    connection.send(JSON.stringify(data));
}

var $game = $('#game');

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

function unoHandleMessage(message) {
    if (message.title == 'join-ok') {
        $('#game-room-id').text(message.roomId)
        unoPageShow('game');

        players = message.players;
        unoGameUpdatePlayers();
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
}

var joinErrors = {
    'NICK-ALREADY-USED': 'Nazwa użytkownika jest już zajęta',
    'TOKEN-ALREADY-USED': 'Nastąpiła kolizja sesji. Odśwież stronę'
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

var players = [];

function unoGameUpdatePlayers() {
    $('#game-players').html('');
    
    for (var i = 0; i < players.length; i++) {
        $('#game-players').append('<li><span class="n">' + players[i] + '</span><span class="c" data-game-player-count-nick="' + players[i] + '">0</span></li>');
    }
}

function unoBindEvents() {
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
    localStorage.clear();

    unoPageShow('start');
    unoBindEvents();
}