const Player = require('./player');


/**
 * This class is responsible for creating the players,
 * communicating with the client's about the players' state.
 */

class MatchManager {
    boardPositions = new Array(9).fill(null);
    player1Info;
    player2Info;

    replay;

    // Create the players
    addPlayer(socket) {
        if(this.player1Info) {
            this.player2Enter(socket);
        } else {
            this.firstPlayerEnter(socket);
        }
    }

    //There is 2 players connected.
    player2Enter(socket) {
        this.player2Info = {
            socket,
            player: new Player('X')
        }

        const response = {sign: this.player2Info.player.sign};
        this.send(socket, response)

        this.startGame();
    }

    // There is only one connection, waiting to another.
    firstPlayerEnter(socket) {
        this.player1Info = {
            socket,
            player: new Player('O')
        }

        const response = {sign: this.player1Info.player.sign};
        this.send(socket, response)

        this.send(socket, {state: 'waiting'});
    }

    startGame() { 
         let yourTurn = true;
        [this.player1Info, this.player2Info].map(player => {
            this.send(player.socket, {state:'start', yourTurn});
            yourTurn = false;
            this.setOnMessage(player);
            this.setOnClose(player);
        })   
    
    }

    setOnMessage(currentPlayer) {
        // All the message from the server is : {position: number} with JSON format.
        currentPlayer.socket.on('message', (msg) => {

            const otherPlayer = this.returnOther(currentPlayer);

            const position = parseInt(JSON.parse(msg).position);
            this.boardPositions[position] = currentPlayer.player.sign; 
    
            const isWinner = currentPlayer.player.checkMove(position);

            const response = {sign: currentPlayer.player.sign, position};
            this.send(otherPlayer.socket, response)
                        
            if(isWinner) {
                this.endGameMessage(currentPlayer.socket, otherPlayer.socket, 'you won');
            } else if(this.isBoardFill()) {
                this.endGameMessage(currentPlayer.socket, otherPlayer.socket, 'draw');
            }  
        })
    }

    setOnClose(currentPlayer) {
        currentPlayer.socket.on('close', () => {
            this.send(this.returnOther(currentPlayer).socket, {state:'Your opponent disconnected, you win!'});
            this.endGame();
        })
    }

    returnOther(player) {
        if(this.player1Info.socket === player.socket) {
            return this.player2Info;
        }
        return this.player1Info;
    }

    isBoardFill() {
        return this.boardPositions.every(position => position !== null);
      }

    endGame() {
        this.player1Info = undefined;
        this.player2Info = undefined;
    }

    endGameMessage(currentSocket, otherSocket, message) {
        let otherMessage;
        
        if(message === 'you won') {
            otherMessage = 'you lost';
        } else {
            otherMessage = message;
        }
        this.send(currentSocket, {state: message});
        this.send(otherSocket, {state: otherMessage});

        this.endGame();
    }


    send(socket, response) {
        socket.send(JSON.stringify(response));
    }
}

// Singelton Pattern
module.exports.matchManager = new MatchManager();