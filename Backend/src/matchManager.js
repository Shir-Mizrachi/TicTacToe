const Player = require('./player')
const messageType = require('./utilities')
/**
 * This class is responsible for creating the players,
 * communicating with the client's about the players' state.
 */

class MatchManager {
    boardPositions = new Array(9).fill(null);
    games = [];

    handleMessgae(msg, socket) {
        console.log('msg: ', msg);
        if(msg.id) {
            if(msg.id > -1) {
                this.handleMessgaeWithId(msg.id, socket);
                return ;
            } 
            this.addPlayer(socket);
        }
    }

    handleMessgaeWithId(id, socket) {
        const player = this.getPlayerById(id);
        player.changeSocket(socket);
        this.setOnMessage(player);
        this.send(socket, {
            type: messageType.playerData,
            positions: this.getAllPositions(player),
            sign: player.sign,
            myTurn: player.myTurn
        });
    }

    getPlayerById(id) {
        let player;
        for(let game of this.games) {
            if(game.player1.id === id) {
                player = game.player1;
                break;
            } else if(game.player2.id === id) {
                player = game.player2;
                break;
            }
        }
        return player;
    }

    // Create the players
    addPlayer(socket) {
        let player;
        let lastGame = this.games[this.games.length -1];
        if(!lastGame || lastGame.player2) {
            player = this.player1Enter(socket);
            const game = {
                player1: player
            };
            this.games.push(game);
        } else {
            player = this.plater2Enter(socket, lastGame);
        }
        return player;
    }

    player1Enter(socket) {
        const sign = 'O';
        const player = new Player.Player(sign, socket, true);
       
        this.send(socket, {
            type: messageType.state,
            state: 'waiting', 
            id: player.id, sign
        });
        return player;
    }

    plater2Enter(socket, game) {
        const sign = 'X';
        game.player2 = new Player.Player(sign, socket, false);       
        const response = {
            type: messageType.setSign,
            sign,
            id: game.player2.id
        };
        this.send(socket, response)
        this.startGame(game);
        return game.player2;
    }

    startGame(game) { 
        let yourTurn = true;
        [game.player1, game.player2].map(player => {
            this.send(player.socket, {
                type: messageType.state,
                state:'start',
                yourTurn
            });
            yourTurn = false;
            this.setOnMessage(player);
        })   
    }

    setOnMessage(currentPlayer) {
        Player.eventEmitter.on('disconnected', ()=> {
            this.send(this.returnOther(currentPlayer).socket, {
                type: messageType.state,
                state:'Your opponent disconnected, you win!'
            });
            this.endGame();
        })

        currentPlayer.socket.on('message', (msg) => {
            msg = JSON.parse(msg);
    
            const otherPlayer = this.returnOther(currentPlayer);

            const position = parseInt(msg.position);
            this.boardPositions[position] = currentPlayer.sign; 
            otherPlayer.myTurn = true;
            currentPlayer.myTurn = false;
            const isWinner = currentPlayer.checkMove(position);

            const response = {
                type: messageType.setPosition,
                sign: currentPlayer.sign,
                position
            };
            this.send(otherPlayer.socket, response)
                        
            if(isWinner) {
                this.endGameMessage(currentPlayer.socket, otherPlayer.socket, 'you won');
            } else if(this.isBoardFill()) {
                this.endGameMessage(currentPlayer.socket, otherPlayer.socket, 'draw');
            }
            
        })
    }

    getAllPositions(currentPlayer) {
        const postions = [];   
        [currentPlayer, this.returnOther(currentPlayer)].map(player => {
            for(let i = 0; i < player.positions.length; i++) {
                if(player.positions[i]) {
                    postions[i] = player.sign;
                }
            }
        })
        return postions;
    }

    returnOther(player) {
        const game = this.games.find(game => {
            return game.player1.id === player.id || game.player2.id === player.id     
        })
        console.log(this.games);
        console.log('player: ', player);

        if(game.player2.id === player.id) {
            return game.player1;
        }
        return game.player2;
    }

    isBoardFill() {
        return this.boardPositions.every(position => position !== null);
    }

    endGame(game) {
        //Remove the game from the players array
        const index = this.games.indexOf(game);
        this.games.splice(index, 1);
    }

    endGameMessage(currentSocket, otherSocket, message) {
        let otherMessage;
        
        if(message === 'you won') {
            otherMessage = 'you lost';
        } else {
            otherMessage = message;
        }
        this.send(currentSocket, {
            type: messageType.state,
            state: message
        });
        this.send(otherSocket, {
            type: messageType.state,
            state: otherMessage
        });

        this.endGame();
    }


    send(socket, response) {
        socket.send(JSON.stringify(response));
    }
}

// Singelton Pattern
module.exports.matchManager = new MatchManager();