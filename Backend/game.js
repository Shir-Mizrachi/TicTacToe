
const matchmodule = require('./matchManager');
const WebSocket = require('ws');

function SetGame(port) {
    const ws = new WebSocket.WebSocketServer({port}, () => {
        console.log('server is created');
    });

    ws.on('connection', (ws) => {
        console.log('new connection!');
        matchmodule.matchManager.addPlayer(ws);        
    }); 

    ws.on('error', (e) => {
        console.log(e);
    });
}

module.exports.SetGame = SetGame;