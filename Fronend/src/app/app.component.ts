import { Component, HostListener, OnInit } from '@angular/core';
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
    console.log('enter');
    this.socket.onmessage = this.handleMassage.bind(this);
  }
  
  handleState(data: {state:string, yourTurn: boolean, id?: number, sign?: string}) {
    console.log(data.state);
    
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
        console.log('waiting');
        this.state = 'Waiting for another player';
        this.sign = data.sign;
        if(data.id) {
          localStorage.setItem('id', data.id.toString())
        }
        break;
    }
  }
  
  handleMassage(event: MessageEvent) {
    const data = JSON.parse(event.data);
    console.log(data);

    if(data.connect) {
      let stringID = localStorage.getItem('id');
      let id;
      if(stringID === null) {
        id = -1;
      } else {
        id = parseInt(stringID)
      }
  
      this.socket.send(JSON.stringify({id})); //Localstorage
    }

    switch(data) {
      case data.state != undefined:
        console.log('enter case');
        
        this.handleState(data);
        break;
      case data.positions != undefined: 
        this.board = data.positions;
        this.sign = data.sign;
        break;
      case data.id != undefined:
        localStorage.set('id', data.id.tostring());
        console.log(localStorage);
        break;
      case data.position != undefined:
        this.isMyTurn = true;
        this.board[data.position] = data.sign;
        break;
      default:
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


