
export const messageOnState = {
    oponentLeft : 'Your opponent disconnected, you win!',
    win: 'you won',
    lost: 'you lost',
    waiting: 'waiting',
    start:'start',
    draw: 'draw'
}

export enum messageType {
    connect,
    state,
    playerData,
    id,
    setPosition, 
    setSign
}