
const matchModule = require('./matchManager');
const WebSocket = require('ws');

function SetGame(port) {
    const websocketServer = new WebSocket.WebSocketServer({port}, () => {
        console.log('server is created');
    });

    websocketServer.on('connection', (ws) => {
        ws.send(JSON.stringify({connect: true}))
        ws.on('message', (msg) => {
            matchModule.matchManager.handleMessgae(JSON.parse(msg), ws);
        });
    }); 

    websocketServer.on('error', (e) => {
        console.log(e);
    });
}

module.exports.SetGame = SetGame;