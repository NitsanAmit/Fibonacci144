import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-layover',
  templateUrl: './layover.component.html',
  styleUrls: ['./layover.component.css']
})
export class LayoverComponent implements OnInit {

  @Input()
  public state : number;

  @Output()
  public gamePaused = new EventEmitter();

  constructor() { }

  ngOnInit(): void {

  }

  newGame(){
    this.gamePaused.emit('New Game');
  }

  keepGoing() {
    this.gamePaused.emit('Keep Going');
  }
}
