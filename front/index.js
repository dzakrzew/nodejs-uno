window.WebSocket = window.WebSocket || window.MozWebSocket;

var connection = new WebSocket('ws://127.0.0.1:1337');

connection.onopen = function() {
    console.info('Connection opened');
}
connection.onerror = function(error) {
    console.error(error);
}

connection.onmessage = function(message) {
    try {
        var json = JSON.parse(message.data);
        console.log(json);
    }
    catch (e) {
        console.warn(e);
    }
}

function uno_init() {
    
}

$(document).ready(uno_init);