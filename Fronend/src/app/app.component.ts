import { Component } from '@angular/core';
import { serverMessage } from './utilities';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'client-app';

  state: string = '';
  
  board = new Array(9).fill('');
  sign: string | undefined;
  
  socket: WebSocket = new WebSocket('ws:/127.0.0.1:5050/');

  constructor() {
    this.socket.onmessage = this.handleMassage;
  }

  handleMassage(event: any) {

    if(this.isBoardFill()) {
      this.state = 'Draw!';
    }

    switch(event.data) {
      case serverMessage.win:
        this.state = 'You won!';
        break;

      case serverMessage.lost:
        this.state = 'You lost!';
        break;

      case serverMessage.oponentLeft:
        this.state = 'Your opponent disconnected, you win!';
        break;

      case serverMessage.firstPlayer:
        this.state = 'waiting for another player';
        break;
      
      case serverMessage.sign:
        this.sign = event.data;
        break;

      default:
        const position = event.data;
        this.board[position] = this.getOtherSign();
    }
  }

  isBoardFill(): boolean {
    return this.board.every(position => position !== '');
  }
    getOtherSign() {
      if(this.sign === 'X') {
        return 'O'
      }
      return 'X';
    }
  }

