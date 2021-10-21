import { Component } from '@angular/core';
import { messageOnState } from './utilities';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'client-app';
  socket: WebSocket = new WebSocket('ws:/127.0.0.1:5050/');

  state: string = '';
  board = new Array(9).fill('');
  sign: string | undefined;
  isMyTurn: boolean | undefined = undefined;

  constructor() {
    this.socket.onmessage = this.handleMassage.bind(this);
  }


  handleState(data: {state:string, yourTurn: boolean}) {
    switch(data.state) {
    
      case messageOnState.start:
        this.isMyTurn = data.yourTurn;
        this.state ='';
        break;

      case messageOnState.win:
        this.state = 'You won!';
        this.isMyTurn = undefined;
        break;

      case messageOnState.lost:
        this.state = 'You lost!';
        this.isMyTurn = undefined;
        break;
      
      case messageOnState.draw:
        this.state = 'Draw'
        this.isMyTurn = undefined;
        break;

      case messageOnState.oponentLeft:
        this.state = 'Your opponent disconnected, you win!';
        this.isMyTurn = undefined;
        break;

      case messageOnState.waiting:
        this.state = 'Waiting for another player';
        break;
    }
  }
  
  handleMassage(event: MessageEvent) {
 
    const data = JSON.parse(event.data);
    
    if(data.state) {
      this.handleState(data);
    } else if(data.position !== undefined) {
        this.isMyTurn = true;
        this.board[data.position] = data.sign;
      } else {
        this.sign = data.sign
      }
    }

    sendPosition(position: number) {
      if(this.isMyTurn && this.board[position] === '') {
        this.board[position] = this.sign;
        this.isMyTurn = false;
        this.socket.send(JSON.stringify({position}));
      }
    }
  }


