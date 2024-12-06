import { AppModule } from './app.module';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameComponent } from './game/game.component';
import { GameModule } from './game/game.module';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, GameModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'ng-fire-pong';
}
