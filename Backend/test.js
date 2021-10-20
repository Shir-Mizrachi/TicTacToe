const ws = require('ws');

const wss = new ws.WebSocket('ws://localhost:5050');

wss.on('open', () => {
    wss.send('x');
});

wss.on('message', (msg) => {
    console.log(msg);
});