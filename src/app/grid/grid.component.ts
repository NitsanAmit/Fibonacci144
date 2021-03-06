import {Component, ElementRef, HostListener, OnInit} from '@angular/core';
import * as Hammer from 'hammerjs';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})

export class GridComponent implements OnInit {

  cells: Cell[][];
  lastMove : string;
  score : number;
  gameState : number; // 0 = ongoing, 1 = game-over, 2 = reached 144, 3 = past 144;

  constructor(private el: ElementRef) {
    this.initGrid();
  }

  ngAfterViewInit(): void {
    this.initTouchSupport();
  }

  ngOnInit(): void {
  }

  initGrid() {
    this.gameState = 0;
    this.score = 0;
    this.lastMove = "";
    this.cells = [];
    for (let i: number = 0; i < 4; i++) {
      this.cells[i] = [];
      for (let j: number = 0; j < 4; j++) {
        this.cells[i][j] = {y: i, x: j, value: 0, state : "empty"};
      }
    }
    this.addRandomTiles(2);
  }

  private initTouchSupport() {
    let hammer = new Hammer(this.el.nativeElement.parentElement);
    hammer.get("swipe").set({ direction: Hammer.DIRECTION_ALL });
    hammer.on("swipeleft", (eventObject) => {
      this.moveTiles({key : LEFT_MOVEMENT_EVENT});
    });
    hammer.on("swiperight", (eventObject) => {
      this.moveTiles({key : RIGHT_MOVEMENT_EVENT});
    });
    hammer.on("swipeup", (eventObject) => {
      this.moveTiles({key : UP_MOVEMENT_EVENT});
    });
    hammer.on("swipedown", (eventObject) => {
      this.moveTiles({key : DOWN_MOVEMENT_EVENT});
    });
  }

  getEmptyCells() {
    const emptyCells: Cell[] = [];
    for (let i: number = 0; i < 4; i++) {
      for (let j: number = 0; j < 4; j++) {
        if (this.cells[i][j].value === 0) {
          emptyCells.push({y: i, x: j, value: 0, state : "empty"});
        }
      }
    }
    return emptyCells;
  }

  private addRandomTiles(numOfTiles: number) {
    const emptyCells = this.getEmptyCells();
    if (numOfTiles == 1) {
      this.addTileAt(emptyCells[Math.floor(Math.random() * emptyCells.length)]);
    } else if (numOfTiles < emptyCells.length) {
      const takenPositions: Cell[] = [];
      while (takenPositions.length < numOfTiles) {
        const proposedPosition = Math.floor(Math.random() * emptyCells.length);
        if (!takenPositions.includes(emptyCells[proposedPosition])) {
          takenPositions.push(emptyCells[proposedPosition]);
          this.addTileAt(emptyCells[proposedPosition]);
        }
      }
    }
  }

  private addTileAt(position: Cell) {
    this.cells[position.y][position.x].value = this.gameState == 3 ? (Math.round(Math.random()) + 1) : INITIAL_TILE_VALUE;
    this.cells[position.y][position.x].state = "new";
  }

  @HostListener("window:keydown", ['$event'])
  moveTiles(event: any) {
    const prevState = this.cells;
    let newState: Cell[][] = null;
    switch (event.key) {
      case LEFT_MOVEMENT_EVENT:
        this.lastMove = LEFT;
        newState = this.cells.map(row => this.moveRowLeft(row));
        break;
      case RIGHT_MOVEMENT_EVENT:
        this.lastMove = RIGHT;
        newState = this.cells.map(row => this.moveRowRight(row));
        break;
      case UP_MOVEMENT_EVENT:
        this.lastMove = UP;
        newState = this.moveColumnsUp();
        break;
      case DOWN_MOVEMENT_EVENT:
        this.lastMove = DOWN;
        newState = this.moveColumnsDown();
        break;
    }
    if (newState != null) {
      const oldStateVals = this.cells.map(row => row.map(cell => cell.value));
      const newStateVals = newState.map(row => row.map(cell => cell.value));
      if (JSON.stringify(oldStateVals) !== JSON.stringify(newStateVals)) {
        this.cells = newState;
        this.addRandomTiles(NEW_TILES_PER_ROUND);
      }
      if (!this.getEmptyCells().length && !this.matchesAvailable()){
        this.gameState = GAME_OVER;
      }
    }
  }

  private getCondensedRowFromRow(row : Cell[]){
    const condensedRow: Cell[] = JSON.parse(JSON.stringify(row));
    for (let i = 0; i < condensedRow.length; i++) {
      condensedRow[i].value = 0;
      condensedRow[i].state = "empty";
    }
    return condensedRow;
  }

  private moveRowLeft(row: Cell[]) {
    const condensedRow: Cell[] = this.getCondensedRowFromRow(row);
    let condensedRowIndex = 0;
    for (let i = 0; i < row.length; i++) {
      let cellValue : number = row[i].value;
      if (cellValue !== 0) {
        let j = 1;
        while ((i + j < row.length) && (row[i + j].value === 0)){
          j++;
        }
        if ((i + j < row.length) && (row[i + j].value == cellValue)) {
          this.mergeTiles(condensedRow, condensedRowIndex, cellValue);
          i = i + j;
        } else {
          condensedRow[condensedRowIndex].value = cellValue;
        }
        condensedRowIndex++;
      }
    }
    return condensedRow;
  }

  test(){
    this.moveColumnsUp();
  }

  private moveRowRight(row: Cell[]) {
    const condensedRow: Cell[] = this.getCondensedRowFromRow(row);
    let condensedRowIndex = row.length-1;
    for (let i = row.length-1; i > -1; i--) {
      let cellValue : number = row[i].value;
      if (cellValue !== 0) {
        let j = 1;
        while ((i - j > -1) && (row[i - j].value === 0)){
          j++;
        }
        if ((i - j > -1) && (row[i - j].value == cellValue)) {
          this.mergeTiles(condensedRow, condensedRowIndex, cellValue);
          i = i - j;
        } else {
          condensedRow[condensedRowIndex].value = cellValue;
        }
        condensedRowIndex--;
      }
    }
    return condensedRow;
  }

  private mergeTiles(condensedRow: Cell[], condensedRowIndex: number, cellValue: number) {
    condensedRow[condensedRowIndex].value = GridComponent.getNextFibonacci(cellValue);
    condensedRow[condensedRowIndex].state = 'merged';
    if (condensedRow[condensedRowIndex].value == WINNER_TILE_VALUE) {
      this.gameState = 2;
    }
    this.score += condensedRow[condensedRowIndex].value;
  }

  private moveColumnsUp() {
    const columns = GridComponent.transposeCells(this.cells);
    return GridComponent.transposeCells(columns.map(col => this.moveRowLeft(col)));
  }

  private moveColumnsDown() {
    const columns = GridComponent.transposeCells(this.cells);
    return GridComponent.transposeCells(columns.map(col => this.moveRowRight(col)));
  }

  private static transposeCells(matrix : Cell[][]) {
    const columns = [];
    const n = matrix.length;
    for (let i = 0; i < n; i++) {
      columns.push([]);
    }
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        columns[j].push(matrix[i][j]);
      }
    }
    return columns;
  }

  private matchesAvailable(){
    let n = this.cells.length;
    let tile;
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        tile = this.cells[row][col];
        if (tile.value) {
          for (let dir = 0; dir < 4; dir++) {
            const vector = DIR_VECTORS[dir];
            if(tile.x + vector.x >= n || tile.y + vector.y >=n || tile.x +vector.x < 0 || tile.y + vector.y < 0){
              continue;
            }
            const neighbour = this.cells[tile.y + vector.y][tile.x + vector.x];
            if (neighbour.value && neighbour.value === tile.value) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  private static getNextFibonacci(current : number) {
    return Math.round(current *  (1 + Math.sqrt(5))/2.0);
  }

  private getNextPrime(current: number) {
    if (current <= 1) {
      return 2;
    }
    let prime = current;
    let found = false;
    while (!found) {
      prime = prime + 1;
      if (this.isPrime(prime)) {
        found = true;
      }
    }
    return prime;
  }

  isPrime(n: number) {
    if (n <= 1) {
      return false;
    }
    if (n <= 3) {
      return true;
    }
    if (n % 2 == 0 || n % 3 == 0) {
      return false;
    }
    for (let i = 5; i * i <= n; i = i + 6) {
      if (n % i == 0 || n % (i + 2) == 0) {
        return false;
      }
    }
    return true;

  }

  onGamePaused(value: string) {
    switch (value) {
      case "New Game":
        this.initGrid();
        break;
      case "Keep Going":
        this.gameState = 3;
        break;
    }
  }
}

interface Cell {
  x : number;
  y : number;
  value : number;
  state : string;
}

//Constants
const INITIAL_TILE_VALUE : number = 1;
const WINNER_TILE_VALUE : number = 144;
const GAME_OVER = 1;
const NEW_TILES_PER_ROUND = 1;
const LEFT : string = "Left";
const LEFT_MOVEMENT_EVENT = "ArrowLeft";
const RIGHT : string = "Right";
const RIGHT_MOVEMENT_EVENT = "ArrowRight";
const UP : string = "Up";
const UP_MOVEMENT_EVENT = "ArrowUp";
const DOWN : string = "Down";
const DOWN_MOVEMENT_EVENT = "ArrowDown";
const DIR_VECTORS = [{x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 0, y: -1}];
