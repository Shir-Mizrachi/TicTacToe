
const matchModule = require('./matchManager');
const WebSocket = require('ws');

function SetGame(port) {
    const websocketServer = new WebSocket.WebSocketServer({port}, () => {
        console.log('server is created');
    });

    websocketServer.on('connection', (connection) => {
        connection.send(JSON.stringify({connect: true}));
        connection.on('message', (msg) => {
            matchModule.matchManager.handleMessgae(JSON.parse(msg), connection);
        });
    }); 

    websocketServer.on('error', (e) => {
        console.log(e);
    });
}

module.exports.SetGame = SetGame;