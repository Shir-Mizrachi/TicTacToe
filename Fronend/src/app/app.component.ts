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
    this.socket.onmessage = this.handleMassage.bind(this);
  }

  isBoardFill(): boolean {
    return this.board.every(position => position !== '');
  }
  
  handleMassage(event: MessageEvent) {

    if(this.isBoardFill()) {
      this.state = 'Draw!';
    }

    console.log('shir enter to handle massage');
    
    console.log(event);
    if(event.data === 'X' || event.data ==='O') {
      console.log('enter to here!');
        
        this.sign = event.data;
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
      
      // case serverMessage.sign:
      //   console.log('enter to here!');
        
      //   this.sign = event.data;
      //   break;

      default:
        const position = event.data;
        this.board[position] = this.getOtherSign();
    }
  }

    getOtherSign() {
      if(this.sign === 'X') {
        return 'O'
      }
      return 'X';
    }

    sendPosition(position: number) {
        this.socket.send(position.toString());
    }
  }


