const Player = require('./player');


class MatchManager {

    player1Info;
    player2Info;

    addPlayer(socket) {
        if(this.player1Info) {
            this.player2Info = {
                socket,
                player: new Player()
            }
            socket.send('X');
            this.startGame();
        } else {
            this.player1Info = {
                socket,
                player: new Player()
            }
            socket.send('O');
        }
    }

    startGame() {
        setOnMessage(this.player1Info);
        setOnMessage(this.player2Info);
        setOnClose(this.player1Info);
        setOnClose(this.player2Info);
    }

    setOnMessage(player) {
        player.socket.on('message', (data) => {
            const isWinner = player.checkMove(data.position);
            returnOther(player).socket.send(data.position);
            
            if(isWinner) {
                player.socket.send('you won!');
                returnOther(player).socket.send('you lost!');

                this.endGame(player);
            }   
        })
    }

    setOnClose(player) {
        player.socket.on('close', () => {
            returnOther(player).socket.send('Your opponent disconnected, you win!');
        })
    }

    endGame() {
        this.player1Info = undefined;
        this.player2Info = undefined;
    }

    returnOther(player) {
        if(this.player1Info.socket === player.socket) {
            return this.player2Info;
        }
        return this.player1Info;
    }
}

module.exports.matchManager = new MatchManager();