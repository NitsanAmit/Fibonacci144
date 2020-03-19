import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.css']
})
export class CellComponent implements OnInit {

  @Input()
  value: number;

  @Input()
  state : string;

  constructor() {
  }

  ngOnInit(): void {
  }

  getBgColorForCellValue(val: number) {
    let defaultColor = "#fb7272";
    const colors = {0: "#fcfcfc", 1: "#f9dc6a" , 2: "#F9F871", 3: "#C6F581", 5: "#95EF96", 7: "#66E5AD" , 8: "#66E5AD", 11: "#38DAC1", 13: "#38DAC1", 15: "#15CCCE", 21: "#15CCCE", 34:"#1dc5d6",55: "#309fd6", 89: "#78bcc3"};
    return colors[val] == null ? defaultColor : colors[val];
  }


}
