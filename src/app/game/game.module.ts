import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameComponent } from './game.component';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [GameComponent],
  imports: [CommonModule, FormsModule],
  exports: [GameComponent],
})
export class GameModule {}
