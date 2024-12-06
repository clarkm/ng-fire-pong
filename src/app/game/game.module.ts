import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireModule } from '@angular/fire/compat';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameComponent } from './game.component';
import { NgModule } from '@angular/core';
import { environment } from '../../environments/environment';

@NgModule({
  declarations: [GameComponent],
  imports: [
    CommonModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase), // Initialize Firebase
    AngularFireDatabaseModule,
  ], // Import the database module
  exports: [GameComponent],
})
export class GameModule {}
