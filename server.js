var WebSocketServer = require('websocket').server;
var http = require('http')

const PORT = 1337;

var server = http.createServer(function(req, res) {
    // nothing
});

function log(message) {
    console.log((new Date()) + ' ' + message);
}

server.listen(PORT, function() {
    log('Server is listening on port ' + PORT);
});

wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', function(req) {
    log('New connection from origin ' + req.origin);

    var connection = req.accept(null, req.origin);
    connection.sendUTF(JSON.stringify({status: 'OK'}));

    connection.on('message', function(message) {
        if (message.type == 'utf-8') {
        }
    });

    connection.on('close', (conn) => {});
});