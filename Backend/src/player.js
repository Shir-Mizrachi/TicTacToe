
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();
const winStates = [
    [0,1,2], [3,4,5], [6,7,8], //rows
    [0,3,6], [1,4,7], [2,5,8], ///columns
    [2,4,6], [0,4,8] //diagonal
]

let lastIndex = 0;

/**
 * This calss responsiable on store the data on the player.
 */
class Player extends EventEmitter {
    selected = 1    
    positions = new Array(9).fill(null);
    sign;
    id;
    socket;
    myTurn;

    constructor(sign, socket, myTurn) {
        super();

        this.sign = sign;
        this.socket = socket;
        this.id = ++lastIndex;
        this.myTurn = myTurn;

        this.socket.on('close', () => {
            setTimeout(() => {
                if(!this.socket.open) {
                    eventEmitter.emit('disconnected');
                }
            }, 5000)
        })
    }

    checkMove(position) {
        this.positions[position] = this.selected;
        return this.isWinner();
    }

    isWinner() {
        return winStates.some(state => (
            state.every((index => this.positions[index] === this.selected))
        ))
    }

    changeSocket(newSocket) {
        this.socket = newSocket;
    }

}

module.exports = {
    Player, 
    eventEmitter
};