import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { GridComponent } from './grid/grid.component';
import { CellComponent } from './grid/cell/cell.component';
import { GameOverComponent } from './grid/game-over/game-over.component';

@NgModule({
  declarations: [
    AppComponent,
    GridComponent,
    CellComponent,
    GameOverComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
