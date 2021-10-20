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
        this.setOnMessage(this.player1Info);
        this.setOnMessage(this.player2Info);
        this.setOnClose(this.player1Info);
        this.setOnClose(this.player2Info);
    }

    setOnMessage(playerInfo) {
        playerInfo.socket.on('message', (data) => {
            console.log(data);
            const isWinner = playerInfo.player.checkMove(parseInt(data));
            this.returnOther(playerInfo).socket.send(data);
            
            if(isWinner) {
                playerInfo.socket.send('you won!');
                this.returnOther(playerInfo).socket.send('you lost!');

                this.endGame(player);
            }   
        })
    }

    setOnClose(playerInfo) {
        playerInfo.socket.on('close', () => {
            this.returnOther(playerInfo).socket.send('Your opponent disconnected, you win!');
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