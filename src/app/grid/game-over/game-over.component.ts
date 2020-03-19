import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-game-over',
  templateUrl: './game-over.component.html',
  styleUrls: ['./game-over.component.css']
})
export class GameOverComponent implements OnInit {

  @Output()
  public onNewGame = new EventEmitter();

  constructor() { }

  ngOnInit(): void {

  }

  newGame(){
    this.onNewGame.emit();
  }

}
