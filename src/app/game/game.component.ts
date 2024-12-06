import { Component, HostListener, OnInit } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/compat/database';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const paddleSpeed = 30;

    if (event.key === 'w' && this.paddle1Y > 0) {
      this.paddle1Y -= paddleSpeed;
    }
    if (
      event.key === 's' &&
      this.paddle1Y < this.canvas.height - this.paddleHeight
    ) {
      this.paddle1Y += paddleSpeed;
    }
    if (event.key === 'ArrowUp' && this.paddle2Y > 0) {
      this.paddle2Y -= paddleSpeed;
    }
    if (
      event.key === 'ArrowDown' &&
      this.paddle2Y < this.canvas.height - this.paddleHeight
    ) {
      this.paddle2Y += paddleSpeed;
    }
  }

  paddleWidth = 10;
  paddleHeight = 80;
  ballRadius = 10;

  paddle1Y = 160; // Initial Y position for Player 1
  paddle2Y = 160; // Initial Y position for Player 2
  ballX = 400;
  ballY = 200;
  ballDX = 2; // Ball horizontal speed
  ballDY = 2; // Ball vertical speed

  player1Score = 0;
  player2Score = 0;

  winningScore = 3;
  isRunning = false; // Game running state
  isPaused = false; // Pause state
  gameLoopId: number | null = null; // Store animation frame ID
  confirmRestart = false;

  difficulty = 'medium';

  constructor(private db: AngularFireDatabase) {}

  updateScores(player1Score: number, player2Score: number) {
    this.db.object('scores').set({ player1Score, player2Score });
  }

  changeDifficulty() {
    if (this.difficulty === 'easy') {
      this.ballDX = this.ballDY = 2;
    } else if (this.difficulty === 'medium') {
      this.ballDX = this.ballDY = 4;
    } else if (this.difficulty === 'hard') {
      this.ballDX = this.ballDY = 6;
    }
  }

  ngOnInit(): void {
    this.canvas = document.getElementById('pongCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    // this.startGame();
    this.db
      .object<{ player1Score: number; player2Score: number }>('scores')
      .valueChanges()
      .subscribe((scores) => {
        if (scores) {
          this.player1Score = scores.player1Score || 0;
          this.player2Score = scores.player2Score || 0;
        }
      });
  }

  startGame() {
    if (this.player1Score > 0 || this.player2Score > 0) {
      this.confirmRestart = confirm('Do you want to start a new game?');
    } else {
      this.confirmRestart = true;
    }
    if (this.confirmRestart) {
      this.resetGame();
      this.isRunning = true;
      this.isPaused = false;
      this.runGameLoop();
    }
  }
  pauseGame() {
    if (this.isRunning) {
      this.isPaused = !this.isPaused;

      if (this.isPaused) {
        cancelAnimationFrame(this.gameLoopId!);
      } else {
        this.runGameLoop();
      }
    }
  }

  runGameLoop() {
    const loop = () => {
      if (!this.isPaused) {
        this.clearCanvas();
        this.drawScores();
        this.drawPaddles();
        this.drawBall();
        this.updateBallPosition();
        this.gameLoopId = requestAnimationFrame(loop);
      }
    };

    this.gameLoopId = requestAnimationFrame(loop);
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawPaddles() {
    // Player 1 Paddle
    this.ctx.fillStyle = 'blue';
    this.ctx.fillRect(0, this.paddle1Y, this.paddleWidth, this.paddleHeight);

    // Player 2 Paddle
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(
      this.canvas.width - this.paddleWidth,
      this.paddle2Y,
      this.paddleWidth,
      this.paddleHeight
    );
  }

  drawBall() {
    this.ctx.beginPath();
    this.ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = 'green';
    this.ctx.fill();
    this.ctx.closePath();
  }

  updateBallPosition() {
    this.ballX += this.ballDX;
    this.ballY += this.ballDY;

    // Ball collision with top and bottom walls
    if (
      this.ballY + this.ballRadius > this.canvas.height ||
      this.ballY - this.ballRadius < 0
    ) {
      this.ballDY = -this.ballDY;
    }

    // Ball collision with paddles
    if (
      this.ballX - this.ballRadius < this.paddleWidth &&
      this.ballY > this.paddle1Y &&
      this.ballY < this.paddle1Y + this.paddleHeight
    ) {
      this.ballDX = -this.ballDX;
    }

    if (
      this.ballX + this.ballRadius > this.canvas.width - this.paddleWidth &&
      this.ballY > this.paddle2Y &&
      this.ballY < this.paddle2Y + this.paddleHeight
    ) {
      this.ballDX = -this.ballDX;
    }

    // Ball out of bounds
    if (
      this.ballX + this.ballRadius < 0 ||
      this.ballX - this.ballRadius > this.canvas.width
    ) {
      this.resetBall();
    }
  }

  resetBall() {
    if (this.ballX + this.ballRadius < 0) {
      this.player2Score++;
    } else if (this.ballX - this.ballRadius > this.canvas.width) {
      this.player1Score++;
    }
    this.updateScores(this.player1Score, this.player2Score);

    this.checkForWin(); // Check for a winner

    this.ballX = this.canvas.width / 2;
    this.ballY = this.canvas.height / 2;
    this.ballDX = -this.ballDX;
  }

  drawScores() {
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = 'black';

    // Player 1 Score
    this.ctx.fillText(`Player 1: ${this.player1Score}`, 20, 30);

    // Player 2 Score
    this.ctx.fillText(
      `Player 2: ${this.player2Score}`,
      this.canvas.width - 140,
      30
    );
  }

  checkForWin() {
    if (this.player1Score === this.winningScore) {
      alert('Player 1 Wins!');
      this.resetGame();
    } else if (this.player2Score === this.winningScore) {
      alert('Player 2 Wins!');
      this.resetGame();
    }
  }

  resetGame() {
    this.player1Score = 0;
    this.player2Score = 0;
    this.ballX = 400;
    this.ballY = 200;
    this.ballDX = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2); // Randomize horizontal speed and direction
    this.ballDY = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2); // Randomize vertical speed and direction
    this.paddle1Y = 160;
    this.paddle2Y = 160;
  }
}
