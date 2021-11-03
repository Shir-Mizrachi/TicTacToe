import { ThrowStmt } from '@angular/compiler';
import { Component, HostListener, OnInit } from '@angular/core';
import { messageOnState, messageType } from './utilities';

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
  
  handleState(data: {state:string, yourTurn: boolean, id?: number, sign?: string}) {
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
        this.sign = data.sign;
        if(data.id) {
          sessionStorage.setItem('id', data.id.toString())
        }
        break;
    }
  }
  
  handleMassage(event: MessageEvent) {
    const data = JSON.parse(event.data);
    const type: messageType = data.type;
    console.log('date: ', data);
    switch(type) {
      case messageType.connect:
        let stringID = sessionStorage.getItem('id');
        let id = stringID === null ? -1 : parseInt(stringID);
        console.log('ID: ', id );
        this.socket.send(JSON.stringify({id}));
        break;

      case messageType.state:
        this.handleState(data);
        break;

      case messageType.playerData: 
        this.board = data.positions;
        this.sign = data.sign;
        this.isMyTurn = data.myTurn;
        break;

      case messageType.id:
        sessionStorage.setItem('id', data.id.tostring());
        break;

      case messageType.setPosition:
        this.isMyTurn = true;
        this.board[data.position] = data.sign;
        break;

      case messageType.setSign:
        this.sign = data.sign;
        if(data.id) {
          sessionStorage.setItem('id', data.id.toString());
        }
    }
  }

    sendPosition(position: number) {
      console.log(this.isMyTurn, position);
      if(this.isMyTurn && this.board[position] === '') {
        this.board[position] = this.sign;
        this.isMyTurn = false;
        this.socket.send(JSON.stringify({position}));
      }
    }
  }


